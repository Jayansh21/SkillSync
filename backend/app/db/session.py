import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Default to empty dict
connect_args = {}

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    logger.info("Connected to database: sqlite")
else:
    logger.info("Connected to database: postgresql") # Assuming postgres if not sqlite generally, or just log the dialect from url string

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
