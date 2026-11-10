# 4KS Ventures Tours & Travel

Website for **4KS Ventures Tours and Travel Ltd**, a Nairobi travel agency.
It handles UAE and US visa applications, flight bookings and safaris.

- **Office:** Suite B18, Rehema House, University Way, Nairobi
- **Phone / WhatsApp:** 0182 668 370 ([wa.me/254182668370](https://wa.me/254182668370))
- **Email:** 4ksventure226@gmail.com
- **Hours:** Monday to Friday, 8:30 am – 5:30 pm (Nairobi time)

## Stack

The site is plain HTML, CSS and JavaScript, with no build step and no dependencies. It is hosted on [Vercel](https://vercel.com).

```
4ksventures/
  *.html            one file per page (home, services, visa-uae, visa-us,
                    flights, travel-tourism, about, how-it-works, faq,
                    contact, and six legal pages)
  css/global.css    the whole design system: tokens, components, responsive rules
  js/main.js        menu, live open/closed status, visa document checker,
                    contact form, destinations row, "how it works" story
  assets/           logo and photos
vercel.json         clean URLs (/about → about.html) and redirects
sitemap.xml         list of pages for search engines
robots.txt          tells search engines where the sitemap is
```

## Running locally

Any static server works. From the repository root:

```bash
npx serve 4ksventures
# or
python3 -m http.server --directory 4ksventures 8000
```

Then open `/home.html`. A local server doesn't apply the clean URLs (`/about`) from `vercel.json`, so open pages by their full file name. On Vercel, clean URLs work.

## Making changes

- **Contact details** appear in the header, footer and contact sections of every page, and in the `BUSINESS` object at the top of `js/main.js`. To change the phone number or email, search and replace across `4ksventures/`.
- **Shared header and footer** are copied into each page. A change to the navigation or footer has to be made in all 16 HTML files.
- **Visa checklists** (the document checker) are in the `VISAS` object in `js/main.js`.
- **New pages** need an entry in `vercel.json` (one rewrite and one redirect) and in `sitemap.xml`.

## Contact form

The form posts to [FormSubmit](https://formsubmit.co), which forwards each enquiry to the email above. The first real submission sends FormSubmit's activation email to that inbox. Click the link in it once, or later enquiries won't be delivered. If sending fails, the form offers a pre-filled WhatsApp message instead.

## Photos

Photos are from [Unsplash](https://unsplash.com), and the photographers are credited in the footer of every page. Replace them with the agency's own photos as they become available.

## Contributors

- [Kamande-Elvy](https://github.com/Kamande-Elvy)
- [Jjumaaa](https://github.com/Jjumaaa)
