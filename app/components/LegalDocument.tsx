import legal from "../../public/legal-documents.json";

export function LegalDocument({ kind }: { kind: "terms" | "privacy" }) {
  const document = legal[kind];
  return <article className="legal-document" aria-label={document.title}>
    <p className="privacy-updated">{legal.revisionLabel}</p>
    {document.sections.map(section => <section className="document-section" key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs.map((paragraph, index) => <p key={index}>
        {paragraph.split(/(https:\/\/[^\s]+)/g).map((part, partIndex) =>
          part.startsWith("https://")
            ? <a className="text-link" key={partIndex} href={part}>{part}</a>
            : part)}
      </p>)}
    </section>)}
  </article>;
}
