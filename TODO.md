# Navigation Fix: Home Button Navigation Issue

## Plan Summary
- Fix the navigation issue where clicking "Home" doesn't take users to the home page.
- Root page (/) should remain as shop online (redirect to /catalog).
- Create a dedicated /home page with landing content.
- Update navigation to link "Home" to /home.

## Tasks
- [x] Create app/home/page.tsx with home page layout (hero, features, brands, testimonials, footer)
- [x] Update components/navigation.tsx to change "Home" href from "/" to "/home"
- [ ] Test navigation: clicking "Home" should go to /home
- [ ] Test root page: accessing / should redirect to /catalog
- [ ] Verify all components render correctly on /home page
