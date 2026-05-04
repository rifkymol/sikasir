from sqlalchemy import text
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./sikasir.db"

engine = create_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False}
)

def _run_legacy_migrations():
    with engine.begin() as connection:
        columns = connection.execute(text("PRAGMA table_info('transaction')")).fetchall()
        column_names = {column[1] for column in columns}

        if 'timestamp' in column_names and 'created_at' not in column_names:
            connection.execute(text('ALTER TABLE "transaction" RENAME COLUMN timestamp TO created_at'))

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    _run_legacy_migrations()

def get_session():
    with Session(engine) as session:
        yield session