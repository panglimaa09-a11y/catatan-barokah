from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Annotated
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="CatatanBarokah Telur API")
api_router = APIRouter(prefix="/api")


def oid_validator(v):
    if isinstance(v, ObjectId):
        return str(v)
    return v


PyObjectId = Annotated[str, BeforeValidator(oid_validator)]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class BaseDocument(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()))

    @classmethod
    def from_mongo(cls, doc: dict):
        if not doc:
            return None
        d = dict(doc)
        if "_id" in d:
            d["id"] = str(d.pop("_id"))
        return cls(**d)

    def to_mongo(self) -> dict:
        d = self.model_dump()
        id_val = d.pop("id", None)
        if isinstance(id_val, str):
            d["_id"] = ObjectId(id_val)
        else:
            d["_id"] = id_val
        return d


# ---------- Transactions (Uang Masuk / Uang Keluar) ----------

class Transaction(BaseDocument):
    type: str  # "masuk" | "keluar"
    amount: float
    category: str
    description: str = ""
    date: str  # YYYY-MM-DD
    qty: Optional[float] = None
    unit: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class TransactionCreate(BaseModel):
    type: str
    amount: float
    category: str
    description: str = ""
    date: str
    qty: Optional[float] = None
    unit: Optional[str] = None


@api_router.get("/")
async def root():
    return {"message": "CatatanBarokah Telur API aktif"}


@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(type: Optional[str] = None):
    query = {}
    if type in ("masuk", "keluar"):
        query["type"] = type
    docs = await db.transactions.find(query).sort("created_at", -1).to_list(1000)
    return [Transaction.from_mongo(d) for d in docs]


@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(input: TransactionCreate):
    if input.type not in ("masuk", "keluar"):
        raise HTTPException(status_code=400, detail="Tipe harus 'masuk' atau 'keluar'")
    if input.amount <= 0:
        raise HTTPException(status_code=400, detail="Nominal harus lebih dari 0")
    tx = Transaction(**input.model_dump())
    await db.transactions.insert_one(tx.to_mongo())
    return tx


@api_router.delete("/transactions/{tx_id}")
async def delete_transaction(tx_id: str):
    try:
        res = await db.transactions.delete_one({"_id": ObjectId(tx_id)})
    except InvalidId:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return {"success": True}


# ---------- Nota (Digital Receipts) ----------

class NotaItem(BaseModel):
    name: str
    qty: float
    unit: str = "peti"
    price: float


class Nota(BaseDocument):
    number: str
    customer_name: str
    customer_phone: str = ""
    items: List[NotaItem]
    total: float
    status: str = "belum"  # "lunas" | "belum"
    note: str = ""
    date: str
    created_at: str = Field(default_factory=now_iso)


class NotaCreate(BaseModel):
    customer_name: str
    customer_phone: str = ""
    items: List[NotaItem]
    status: str = "belum"
    note: str = ""
    date: str


class NotaStatusUpdate(BaseModel):
    status: str


@api_router.get("/nota", response_model=List[Nota])
async def get_nota():
    docs = await db.nota.find().sort("created_at", -1).to_list(1000)
    return [Nota.from_mongo(d) for d in docs]


@api_router.post("/nota", response_model=Nota)
async def create_nota(input: NotaCreate):
    if not input.items:
        raise HTTPException(status_code=400, detail="Nota minimal memiliki 1 item")
    if not input.customer_name.strip():
        raise HTTPException(status_code=400, detail="Nama pelanggan wajib diisi")
    total = sum(i.qty * i.price for i in input.items)
    number = "NT-" + datetime.now(timezone.utc).strftime("%y%m%d%H%M%S")
    nota = Nota(number=number, total=total, **input.model_dump())
    await db.nota.insert_one(nota.to_mongo())
    return nota


@api_router.put("/nota/{nota_id}/status", response_model=Nota)
async def update_nota_status(nota_id: str, input: NotaStatusUpdate):
    if input.status not in ("lunas", "belum"):
        raise HTTPException(status_code=400, detail="Status tidak valid")
    try:
        oid = ObjectId(nota_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="Nota tidak ditemukan")
    res = await db.nota.find_one_and_update(
        {"_id": oid}, {"$set": {"status": input.status}}, return_document=True
    )
    if not res:
        raise HTTPException(status_code=404, detail="Nota tidak ditemukan")
    return Nota.from_mongo(res)


@api_router.delete("/nota/{nota_id}")
async def delete_nota(nota_id: str):
    try:
        res = await db.nota.delete_one({"_id": ObjectId(nota_id)})
    except InvalidId:
        raise HTTPException(status_code=404, detail="Nota tidak ditemukan")
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nota tidak ditemukan")
    return {"success": True}


# ---------- Dashboard ----------

@api_router.get("/dashboard")
async def get_dashboard():
    txs = await db.transactions.find().to_list(10000)
    notas = await db.nota.find().to_list(10000)

    total_masuk = sum(t["amount"] for t in txs if t["type"] == "masuk")
    total_keluar = sum(t["amount"] for t in txs if t["type"] == "keluar")
    saldo = total_masuk - total_keluar
    peti_terjual = sum(
        (t.get("qty") or 0)
        for t in txs
        if t["type"] == "masuk" and t.get("unit") == "peti"
    )

    today = datetime.now(timezone.utc)
    daily = defaultdict(lambda: {"masuk": 0.0, "keluar": 0.0})
    for i in range(6, -1, -1):
        d = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        daily[d]
    for t in txs:
        d = t.get("date")
        if d in daily:
            daily[d]["masuk" if t["type"] == "masuk" else "keluar"] += t["amount"]
    series = [{"date": d, **vals} for d, vals in daily.items()]

    cat = defaultdict(lambda: {"masuk": 0.0, "keluar": 0.0})
    for t in txs:
        key = t.get("category") or "Lain-lain"
        cat[key]["masuk" if t["type"] == "masuk" else "keluar"] += t["amount"]
    categories = [{"category": k, **vals} for k, vals in cat.items()]

    nota_unpaid = sum(1 for n in notas if n.get("status") != "lunas")
    nota_unpaid_total = sum(n.get("total", 0) for n in notas if n.get("status") != "lunas")
    nota_count = len(notas)

    recent_docs = sorted(txs, key=lambda t: t.get("created_at", ""), reverse=True)[:6]
    recent = [Transaction.from_mongo(r) for r in recent_docs]

    return {
        "total_masuk": total_masuk,
        "total_keluar": total_keluar,
        "saldo": saldo,
        "peti_terjual": peti_terjual,
        "total_transaksi": len(txs),
        "series": series,
        "categories": categories,
        "nota_count": nota_count,
        "nota_unpaid": nota_unpaid,
        "nota_unpaid_total": nota_unpaid_total,
        "recent": recent,
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
