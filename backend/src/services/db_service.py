import sqlalchemy
from attrs import define, field


@define
class DatabaseBuilder:
    database_url: str
    engine: sqlalchemy.engine.base.Engine = field(init=False)
    metadata: sqlalchemy.MetaData = field(init=False)
    images: sqlalchemy.Table = field(init=False)

    def __attrs_post_init__(self):
        self.engine = sqlalchemy.create_engine(self.database_url)
        self.metadata = sqlalchemy.MetaData()
        self.images = sqlalchemy.Table("images",
                          self.metadata,
                          sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
                          sqlalchemy.Column("image_data", sqlalchemy.LargeBinary)
                                       )

    def init_db(self):
        self.metadata.create_all(self.engine)

    def insert_image(self, image_data):
        with self.engine.connect() as conn:
            query = self.images.insert().values(image_data=image_data)
            conn.execute(query)

    def get_image_by_id(self, image_id: int):
        with self.engine.connect() as conn:
            query = self.images.select().where(self.images.c.id == image_id)
            result = conn.execute(query).fetchone()
            return result.image_data if result else None
