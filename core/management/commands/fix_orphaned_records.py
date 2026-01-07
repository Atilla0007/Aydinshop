"""
Management command to fix orphaned records that violate foreign key constraints.
This command safely cleans up records that reference non-existent parent records.
"""
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from core.models import ContactMessage, SiteVisit
from store.models import ProductImage, ProductFeature, ProductReview


class Command(BaseCommand):
    help = 'Fix orphaned records that violate foreign key constraints'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be fixed without actually fixing it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        fixed_count = 0
        
        with transaction.atomic():
            # Fix ContactMessage.product_interest (SET_NULL is safe)
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE core_contactmessage 
                    SET product_interest_id = NULL 
                    WHERE product_interest_id IS NOT NULL 
                    AND product_interest_id NOT IN (SELECT id FROM store_product)
                """)
                count = cursor.rowcount
                if count > 0:
                    fixed_count += count
                    self.stdout.write(self.style.SUCCESS(
                        f'Fixed {count} ContactMessage records with orphaned product_interest'
                    ))
            
            # Fix SiteVisit.user (SET_NULL is safe)
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE core_sitevisit 
                    SET user_id = NULL 
                    WHERE user_id IS NOT NULL 
                    AND user_id NOT IN (SELECT id FROM auth_user)
                """)
                count = cursor.rowcount
                if count > 0:
                    fixed_count += count
                    self.stdout.write(self.style.SUCCESS(
                        f'Fixed {count} SiteVisit records with orphaned user'
                    ))
            
            # Fix ProductImage.product (CASCADE - should delete, but we'll set to NULL if product is missing)
            # Actually, these should be deleted if product is missing (CASCADE behavior)
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM store_productimage 
                    WHERE product_id NOT IN (SELECT id FROM store_product)
                """)
                count = cursor.rowcount
                if count > 0:
                    fixed_count += count
                    self.stdout.write(self.style.SUCCESS(
                        f'Deleted {count} ProductImage records with orphaned product'
                    ))
            
            # Fix ProductFeature.product (CASCADE - should delete)
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM store_productfeature 
                    WHERE product_id NOT IN (SELECT id FROM store_product)
                """)
                count = cursor.rowcount
                if count > 0:
                    fixed_count += count
                    self.stdout.write(self.style.SUCCESS(
                        f'Deleted {count} ProductFeature records with orphaned product'
                    ))
            
            # Fix ProductReview.product (CASCADE - should delete)
            with connection.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM store_productreview 
                    WHERE product_id NOT IN (SELECT id FROM store_product)
                """)
                count = cursor.rowcount
                if count > 0:
                    fixed_count += count
                    self.stdout.write(self.style.SUCCESS(
                        f'Deleted {count} ProductReview records with orphaned product'
                    ))
            
            if dry_run:
                transaction.set_rollback(True)
                self.stdout.write(self.style.WARNING(
                    f'\nDRY RUN: Would have fixed {fixed_count} records'
                ))
            else:
                if fixed_count > 0:
                    self.stdout.write(self.style.SUCCESS(
                        f'\nSuccessfully fixed {fixed_count} orphaned records!'
                    ))
                else:
                    self.stdout.write(self.style.SUCCESS('No orphaned records found.'))

