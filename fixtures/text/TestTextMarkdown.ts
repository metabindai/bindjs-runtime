const metadata = {
    title: "TestTextMarkdown",
    description: "A long markdown document in a scroll view: H1/H2/H3 headings at decreasing sizes, **bold** and *italic* runs, horizontal rules, bullet lists with a nested indented sub-list, and multi-paragraph prose, all rendered as formatted text (no raw markdown syntax visible) with 4pt extra line spacing."
};

const markdown = `
# Metabind Presentation for Lowe's
## Native Mobile CMS Overview

**Target Audience:** Product/Design Team + Engineering Director.
**Duration:** 30-40 minutes.
**Goal:** Demonstrate how Metabind enables instant mobile app updates for retail experiences.


## Slide 1: Title Slide
---

### Slide Content
**Metabind**
The Native Mobile CMS for Your iOS & Android App

*Presented to Lowe's*
[Date]

### Visuals
* Metabind logo
* Clean background with subtle retail/home improvement imagery (tools, paint, garden)
* Optional: Animation showing mobile phone transitioning between different app screens


## Slide 3: Introducing Metabind
---

### Slide Content
**The First CMS Built for Native Mobile Apps**

Manage both **content AND UI** for your iOS and Android app.

**Update layouts, flows, and experiences in minutes—**
without app store delays or developer bottlenecks.

**100% Native on Device**

### Visuals
- Central image of mobile phone showing beautiful native app interface
- Surrounding icons showing key capabilities:
  - CMS icon (content management)
  - Layout/design icon (UI management)
  - Clock icon (instant updates)
  - Native rendering icon (SwiftUI/Jetpack Compose logos)
- Optional: Short video loop showing an experience being edited in CMS and updating instantly on device

### Speaker Notes
Metabind is the Native Mobile CMS—the first content management system built specifically to solve this problem for native mobile apps.

Unlike traditional headless CMSs that only manage your content DATA, Metabind manages both your content AND your presentation layer—the UI, the layouts, the flows.

This means your product and marketing teams can:
- Update content (product info, images, copy)
- AND update layouts (how content is structured and displayed)
- AND update flows (navigation, user journeys)

All through a visual CMS interface, with changes deploying instantly to users' apps—no app store submission, no waiting for approval, no developer bottleneck.

And critically for Lowe's: this isn't done with web views or hybrid compromises. Everything renders as true native components—SwiftUI on iOS, Jetpack Compose on Android—maintaining the premium native experience your customers expect.

---
`;

const body = () => (
    ScrollView([
        Text({ markdown }).lineSpacing(4)
    ])
);

export default defineComponent({ metadata, body });
