"""
Management command to seed filtered words
"""
from django.core.management.base import BaseCommand
from posts.models import FilteredWord


class Command(BaseCommand):
    help = 'Seed database with common profane words to filter'
    
    def handle(self, *args, **options):
        # Common profane words to filter (masked)
        words = [
            ('fuck', 'f**k'),
            ('shit', 's**t'),
            ('bitch', 'b***h'),
            ('damn', 'd**n'),
            ('ass', 'a**'),
            ('hell', 'h**l'),
            ('bastard', 'b*****d'),
            ('crap', 'c**p'),
        ]
        
        created_count = 0
        for word, replacement in words:
            _, created = FilteredWord.objects.get_or_create(
                word=word,
                defaults={'replacement': replacement}
            )
            if created:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully seeded {created_count} filtered words '
                f'({len(words) - created_count} already existed)'
            )
        )
