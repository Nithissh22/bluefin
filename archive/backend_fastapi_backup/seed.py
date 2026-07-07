import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.product import Product
from app.models.enums import UserRole
from app.core.security import get_password_hash

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Seeding Admin user...")
    admin = db.query(User).filter(User.email == "admin@oms.com").first()
    if not admin:
        admin = User(
            email="admin@oms.com",
            name="Super Admin",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin)
        
    print("Seeding Staff user...")
    staff = db.query(User).filter(User.email == "staff@oms.com").first()
    if not staff:
        staff = User(
            email="staff@oms.com",
            name="Warehouse Staff",
            password_hash=get_password_hash("staff123"),
            role=UserRole.STAFF
        )
        db.add(staff)
        
    print("Seeding Client user...")
    client = db.query(User).filter(User.email == "client@oms.com").first()
    if not client:
        client = User(
            email="client@oms.com",
            name="Big Client LLC",
            password_hash=get_password_hash("client123"),
            role=UserRole.CLIENT
        )
        db.add(client)
        
    print("Seeding Products...")
    
    # Clear existing products
    db.query(Product).delete()
    db.commit()
    
    products = [
            Product(
                name="High-Speed Microcentrifuge",
                category="Lab Equipment",
                description="Compact high-speed microcentrifuge with a max speed of 15,000 rpm. Includes a 12-place rotor for 1.5/2.0 mL tubes.",
                price=1250.00,
                stock=25,
                image_url="https://images.unsplash.com/photo-1582719471327-5136d5e165d0?w=800&q=80"
            ),
            Product(
                name="PCR Thermal Cycler",
                category="Lab Equipment",
                description="Advanced thermal cycler with a 96-well block, intuitive touch screen interface, and fast heating/cooling rates.",
                price=4500.00,
                stock=10,
                image_url="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80"
            ),
            Product(
                name="Digital Lab Vortex Mixer",
                category="Instruments",
                description="Variable speed vortex mixer for touch or continuous operation. Essential for rapid sample mixing.",
                price=185.50,
                stock=40,
                image_url="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80"
            ),
            Product(
                name="Precision Micro-Pipette Set",
                category="Supplies",
                description="Set of 4 adjustable volume micropipettes (0.5-10µL, 10-100µL, 20-200µL, 100-1000µL) with ergonomic design.",
                price=320.00,
                stock=50,
                image_url="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80"
            ),
            Product(
                name="Compound Binocular Microscope",
                category="Instruments",
                description="Professional binocular microscope with LED illumination, 40X-1000X magnification, and mechanical stage.",
                price=850.00,
                stock=15,
                image_url="https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&q=80"
            ),
            Product(
                name="UV-Vis Spectrophotometer",
                category="Lab Equipment",
                description="Double-beam UV-Visible spectrophotometer for quantitative analysis and kinetics, wavelength range 190-1100 nm.",
                price=6200.00,
                stock=5,
                image_url="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80"
            ),
            Product(
                name="Biosafety Cabinet Class II",
                category="Infrastructure",
                description="Biological safety cabinet providing personnel, product, and environmental protection. HEPA filtered.",
                price=9500.00,
                stock=2,
                image_url="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
            ),
            Product(
                name="Automated Cell Counter",
                category="Instruments",
                description="High-throughput automated cell counter providing accurate viability and cell counts in seconds.",
                price=2400.00,
                stock=8,
                image_url="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80"
            ),
            Product(
                name="DNA Extraction Kit (50 Preps)",
                category="Reagents",
                description="Quick and reliable spin-column based genomic DNA extraction kit for tissue and cell culture samples.",
                price=145.00,
                stock=120,
                image_url="https://images.unsplash.com/photo-1614935151651-0bea6508abb0?w=800&q=80"
            ),
            Product(
                name="Magnetic Stirrer with Hot Plate",
                category="Instruments",
                description="Ceramic-top magnetic stirrer with heating plate, digital temperature control up to 380°C.",
                price=210.00,
                stock=35,
                image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"
            )
        ]
    db.add_all(products)

    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
