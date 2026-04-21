from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./sikasir.db"

engine = create_engine(DATABASE_URL, echo=True)