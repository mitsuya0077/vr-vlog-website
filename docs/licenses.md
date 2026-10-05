# License notices

The public `/licenses/` page is built from `data/licenses.json` and the UTF-8
notices in `public/licenses/`. The notices retain upstream copyright statements,
license terms, and bundled third-party notices in their original language.
They are also available as plain text and without JavaScript.
The `.gitattributes` rule preserves notice bytes without line-ending conversion.

The homepage is installed from `site/homepage.html` after Next.js export. Keep
its footer link in sync with `app/components/SiteChrome.tsx` and the standalone
getting-started guide in `public/guide/index.html`.

When dependencies or assets change:

- Inspect the exact pinned release, including embedded and transitive libraries,
  native archives, model licenses, and `NOTICE`/third-party-notice files.
- Confirm both runtime use and build payloads. A retired feature may leave models
  in the distribution, so do not describe those models as active functionality.
- Replace the relevant original texts and update their manifest entries. Keep
  app dependencies separate from exporter dependencies and website build tools.
- For the website, inspect `package-lock.json` and Next.js's bundled libraries,
  not only the top-level `package.json`. Native build tools are described with
  their build scope; they are not served as native executables by GitHub Pages.
- Do not publish private app source, SDK injection files, credentials, machine
  paths, raw device captures, or avatar model files.
- Retain nearby avatar and VOICEVOX credits in existing images/video pages.
  The credits page supplements these attributions.
- Run `npm run lint`, `npm run build:pages`, and check the exported page, plain
  text links, footer navigation, and mobile wrapping before publishing.

Publishing notices on the website does not remove any separate requirements
that apply when distributing app binaries, exporter packages, or modified
third-party source. Preserve notices in those distributions as well.

The application audit covers the current iPhone product. The Android source
declares different native dependency versions and must receive its own audit
before an Android distribution is published. Unity 2022.3.62f3's common
`legal.txt` is retained in full, including Editor/build components; its scope
does not imply every listed component is embedded in the application.

The exporter website notices include the BouncyCastle assembly's embedded
Bzip2, JZlib, Falcon, and Serpent notices. Existing exporter package notices
must also retain these texts when that assembly is redistributed.
