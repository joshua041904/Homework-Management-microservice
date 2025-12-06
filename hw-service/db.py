from typing import Optional

from sqlmodel import SQLModel, Field, create_engine, Session
from datetime import datetime
import os

# Load the Postgres DSN (connection string) from environment variables
PG_DSN = os.getenv("PG_DSN")

# Create the SQLAlchemy engine that connects to your database
engine = create_engine(PG_DSN, echo=False)

# define the Homework model — represents one table in Postgres
class Homework(SQLModel, table=True):
    __tablename__ = "homework"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True) # ID from user-service
    assignment_name: str
    course: Optional[str] = None
    due_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

# create tables if they don't exist
def init_db():
    SQLModel.metadata.create_all(engine)
    print("Database initialized and tables created (if not exist).")

# close the database connection cleanly
def close_db_connection():
    engine.dispose()
    print("Database connection closed.")

def get_session():
    with Session(engine) as session:
        yield session