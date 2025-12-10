from typing import Optional

from sqlmodel import SQLModel, Field, create_engine, Session
from datetime import datetime
import os

# Load the Postgres DSN (connection string) from environment variables
PG_DSN = os.getenv("PG_DSN")

# Create the SQLAlchemy engine that connects to your database
engine = create_engine(PG_DSN, echo=False)

# define the User model — represents one table in Postgres
class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True, unique=True)
    grade_level: Optional[str] = None
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

def db_create_user(
    session: Session,
    name: str,
    email: str,
    grade_level: str | None,
) -> User:
    user = User(
        name=name,
        email=email,
        grade_level=grade_level,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user