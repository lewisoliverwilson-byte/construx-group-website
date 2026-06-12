interface TitleBlockProps {
  sheet?: string;
  title?: string;
  rev?: string;
  className?: string;
}

/**
 * Engineering drawing title block — the corner stamp on every real
 * drafting sheet. DRAWN / CHECKED / SCALE / SHEET / REV.
 */
export default function TitleBlock({
  sheet = '01 / 05',
  title = 'CONSTRUX GROUP — STUDIO',
  rev = 'B',
  className = '',
}: TitleBlockProps) {
  return (
    <table className={`title-block border-collapse ${className}`} aria-hidden="true">
      <tbody>
        <tr>
          <td className="tb-label">Title</td>
          <td className="tb-value" colSpan={3}>{title}</td>
        </tr>
        <tr>
          <td className="tb-label">Drawn</td>
          <td className="tb-value">WILSON · BOYD</td>
          <td className="tb-label">Checked</td>
          <td className="tb-value">CLAUDE</td>
        </tr>
        <tr>
          <td className="tb-label">Scale</td>
          <td className="tb-value">1:1</td>
          <td className="tb-label">Date</td>
          <td className="tb-value">{new Date().getFullYear()}</td>
        </tr>
        <tr>
          <td className="tb-label">Sheet</td>
          <td className="tb-value">{sheet}</td>
          <td className="tb-label">Rev</td>
          <td className="tb-value" style={{ color: 'var(--orange)' }}>{rev}</td>
        </tr>
      </tbody>
    </table>
  );
}
