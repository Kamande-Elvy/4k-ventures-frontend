from pathlib import Path

root = Path(r'c:\Users\kamande\Downloads\4ksventures-website')
site = root / '4ksventures'
replacements = {
    'index.html': 'home',
    'home.html': 'home',
    'about.html': 'about',
    'services.html': 'services',
    'visa-uae.html': 'visa-uae',
    'visa-us.html': 'visa-us',
    'flights.html': 'flights',
    'travel-tourism.html': 'travel-tourism',
    'how-it-works.html': 'how-it-works',
    'faq.html': 'faq',
    'contact.html': 'contact',
    'privacy-policy.html': 'privacy-policy',
    'terms-conditions.html': 'terms-conditions',
    'visa-disclaimer.html': 'visa-disclaimer',
    'refund-policy.html': 'refund-policy',
    'cookie-policy.html': 'cookie-policy',
    'complaints.html': 'complaints',
}

updated = []
for p in sorted(site.rglob('*.html')):
    text = p.read_text(encoding='utf-8')
    before = text
    for old, new in replacements.items():
        text = text.replace(old, new)
        text = text.replace(f'./{old}', f'./{new}')
        text = text.replace(f'/{old}', f'/{new}')
        text = text.replace(f'"{old}"', f'"{new}"')
        text = text.replace(f"'{old}'", f"'{new}'")
    if text != before:
        p.write_text(text, encoding='utf-8')
        updated.append(str(p.relative_to(root)))

print(f'updated_files={len(updated)}')
for item in updated[:20]:
    print(item)
