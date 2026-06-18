from typing import List, Optional

from sqlmodel import SQLModel, Field, create_engine, Session, select
from sqlalchemy import text
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
    file_original_name: Optional[str] = None
    file_storage_name: Optional[str] = None
    file_content_type: Optional[str] = None
    file_size_bytes: Optional[int] = None

# create tables if they don't exist
def init_db():
    SQLModel.metadata.create_all(engine)
    _migrate_schema()
    print("Database initialized and tables created (if not exist).")


def _migrate_schema():
    """Add file metadata columns to existing homework tables."""
    columns = [
        ("file_original_name", "VARCHAR"),
        ("file_storage_name", "VARCHAR"),
        ("file_content_type", "VARCHAR"),
        ("file_size_bytes", "INTEGER"),
    ]
    with engine.begin() as conn:
        for name, col_type in columns:
            conn.execute(
                text(
                    f"ALTER TABLE homework ADD COLUMN IF NOT EXISTS {name} {col_type}"
                )
            )

# close the database connection cleanly
def close_db_connection():
    engine.dispose()
    print("Database connection closed.")

def get_session():
    with Session(engine) as session:
        yield session


def db_create_assignment(
    session: Session,
    user_id: int,
    assignment_name: str,
    course: str | None,
    due_date: datetime,
) -> Homework:
    hw = Homework(
        user_id=user_id,
        assignment_name=assignment_name,
        course=course,
        due_date=due_date,
    )
    session.add(hw)
    session.commit()
    session.refresh(hw)
    return hw

def db_get_homework_for_user(
        session: Session,
        user_id: int
) -> List[Homework]:
    statement = select(Homework).where(Homework.user_id == user_id)
    return session.exec(statement).all()