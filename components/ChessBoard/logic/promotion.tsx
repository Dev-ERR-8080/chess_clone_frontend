interface PromotionModalProps {
  color: "WHITE" | "BLACK";
  onSelect: (piece: string) => void;
}

export default function PromotionModal({ color, onSelect }: PromotionModalProps) {
  const pieces = ["Q", "R", "B", "N"];

  return (
    <div className="promotion-overlay" style={{
      position: 'absolute',
      zIndex: 100,
      background: 'white',
      display: 'flex',
      gap: '10px',
      padding: '10px',
      border: '1px solid #ccc'
    }}>
      {pieces.map(p => (
        <img
          key={p}
          style={{ width: 50, cursor: 'pointer' }}
          // Note: fixed the string template for the image URL
          src={`https://assets-themes.chess.com/image/ejgfv/150/${color}${p.toLowerCase()}.png`}
          onClick={() => onSelect(color + p)}
          alt={p}
        />
      ))}
    </div>
  );
}