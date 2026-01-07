"""
Management command to check and report foreign key constraint issues.
This helps identify orphaned records that might cause IntegrityErrors.
"""
from django.core.management.base import BaseCommand
from django.db import connection
from core.models import ContactMessage, SiteVisit
from store.models import Product, ProductImage, ProductFeature, ProductReview


class Command(BaseCommand):
    help = 'Check for foreign key constraint issues and orphaned records'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Checking foreign key constraints...'))
        
        issues_found = False
        
        # Check ContactMessage.product_interest
        orphaned_contacts = ContactMessage.objects.filter(
            product_interest__isnull=False
        ).exclude(product_interest__isnull=False)
        
        # More accurate check
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT cm.id, cm.product_interest_id 
                FROM core_contactmessage cm
                LEFT JOIN store_product p ON cm.product_interest_id = p.id
                WHERE cm.product_interest_id IS NOT NULL AND p.id IS NULL
            """)
            orphaned_contact_products = cursor.fetchall()
            
            if orphaned_contact_products:
                issues_found = True
                self.stdout.write(self.style.WARNING(
                    f'Found {len(orphaned_contact_products)} ContactMessage records with orphaned product_interest'
                ))
                for contact_id, product_id in orphaned_contact_products:
                    self.stdout.write(f'  - ContactMessage ID {contact_id} references non-existent Product ID {product_id}')
        
        # Check SiteVisit.user
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT sv.id, sv.user_id 
                FROM core_sitevisit sv
                LEFT JOIN auth_user u ON sv.user_id = u.id
                WHERE sv.user_id IS NOT NULL AND u.id IS NULL
            """)
            orphaned_visits = cursor.fetchall()
            
            if orphaned_visits:
                issues_found = True
                self.stdout.write(self.style.WARNING(
                    f'Found {len(orphaned_visits)} SiteVisit records with orphaned user'
                ))
                for visit_id, user_id in orphaned_visits:
                    self.stdout.write(f'  - SiteVisit ID {visit_id} references non-existent User ID {user_id}')
        
        # Check Product.category
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id, p.category_id 
                FROM store_product p
                LEFT JOIN store_category c ON p.category_id = c.id
                WHERE c.id IS NULL
            """)
            orphaned_products = cursor.fetchall()
            
            if orphaned_products:
                issues_found = True
                self.stdout.write(self.style.ERROR(
                    f'Found {len(orphaned_products)} Product records with orphaned category (CRITICAL!)'
                ))
                for product_id, category_id in orphaned_products:
                    self.stdout.write(f'  - Product ID {product_id} references non-existent Category ID {category_id}')
        
        # Check ProductImage.product
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT pi.id, pi.product_id 
                FROM store_productimage pi
                LEFT JOIN store_product p ON pi.product_id = p.id
                WHERE p.id IS NULL
            """)
            orphaned_images = cursor.fetchall()
            
            if orphaned_images:
                issues_found = True
                self.stdout.write(self.style.ERROR(
                    f'Found {len(orphaned_images)} ProductImage records with orphaned product (CRITICAL!)'
                ))
                for image_id, product_id in orphaned_images:
                    self.stdout.write(f'  - ProductImage ID {image_id} references non-existent Product ID {product_id}')
        
        # Check ProductFeature.product
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT pf.id, pf.product_id 
                FROM store_productfeature pf
                LEFT JOIN store_product p ON pf.product_id = p.id
                WHERE p.id IS NULL
            """)
            orphaned_features = cursor.fetchall()
            
            if orphaned_features:
                issues_found = True
                self.stdout.write(self.style.ERROR(
                    f'Found {len(orphaned_features)} ProductFeature records with orphaned product (CRITICAL!)'
                ))
                for feature_id, product_id in orphaned_features:
                    self.stdout.write(f'  - ProductFeature ID {feature_id} references non-existent Product ID {product_id}')
        
        # Check ProductReview.product
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT pr.id, pr.product_id 
                FROM store_productreview pr
                LEFT JOIN store_product p ON pr.product_id = p.id
                WHERE p.id IS NULL
            """)
            orphaned_reviews = cursor.fetchall()
            
            if orphaned_reviews:
                issues_found = True
                self.stdout.write(self.style.ERROR(
                    f'Found {len(orphaned_reviews)} ProductReview records with orphaned product (CRITICAL!)'
                ))
                for review_id, product_id in orphaned_reviews:
                    self.stdout.write(f'  - ProductReview ID {review_id} references non-existent Product ID {product_id}')
        
        if not issues_found:
            self.stdout.write(self.style.SUCCESS('No foreign key constraint issues found!'))
        else:
            self.stdout.write(self.style.WARNING(
                '\nTo fix these issues, run: python manage.py fix_orphaned_records'
            ))

