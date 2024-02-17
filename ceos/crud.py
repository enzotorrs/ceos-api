from sqlalchemy.orm import Session

from . import models, schemas


def get_assets(db: Session):
    assets = db.query(models.Asset).all()
    return assets


def get_asset(asset_id: int, db: Session):
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()


def update_asset(
    db: Session, stored_asset: models.Asset, new_asset_content: schemas.AssetUpdate
):
    db.query(models.Asset).filter(models.Asset.id == stored_asset.id).update(
        new_asset_content.model_dump()
    )
    db.commit()
    db.refresh(stored_asset)
    return stored_asset


def create_asset(db: Session, asset: schemas.AssetCreate):
    db_asset = models.Asset(
        name=asset.name, folder=asset.folder, parent_asset_id=asset.parent_asset_id
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset
