from typing import Optional

from sqlmodel import SQLModel, Field, create_engine, Session
from datetime import datetime
import os

# Load the Postgres DSN (connection string) from environment variables
PG_DSN = os.getenv("PG_DSN")

# Create the SQLAlchemy engine that connects to your database
engine = create_engine(PG_DSN, echo=False)

# defines the Notifications model — represents one table in Postgres
class Notifications(SQLModel, table=True):
    __tablename__ = "notifications"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True) 
    homework_id: Optional[int] = Field(default=None, index=True)
    message: str
    due_date: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sent: bool = Field(default=False)

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

def db_create_notification(
    session: Session,
    user_id: int,
    homework_id: int,
    message: str,
    due_date: datetime,
) -> Notifications:
    notification = Notifications(
        user_id = user_id,
        homework_id = homework_id,
        message = message,
        due_date = due_date,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification