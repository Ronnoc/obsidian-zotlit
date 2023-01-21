import type { AnnotationInfo, TagInfo } from "@obzt/database";
import { useSet } from "ahooks";
import AnnotPreview from "./AnnotPreview";

export interface AnnotListProps {
  annotations: AnnotationInfo[];
  getTags(itemId: number): TagInfo[];
  selectable?: boolean;
}

export default function AnnotList({
  selectable = false,
  annotations,
  getTags,
}: AnnotListProps) {
  const [selected, { add, remove }] = useSet<AnnotationInfo>();
  return (
    <div className="annot-list">
      {annotations.map((annot) => (
        <div
          key={annot.itemID}
          className="annot-list-item"
          role="menuitem"
          tabIndex={0}
        >
          {selectable && (
            <SelectCheckbox
              checked={selected.has(annot)}
              toggle={(v) => (v ? add : remove)(annot)}
            />
          )}
          <AnnotPreview annotation={annot} tags={getTags(annot.itemID)} />
        </div>
      ))}
    </div>
  );
}

const SelectCheckbox = ({
  checked,
  toggle,
}: {
  checked: boolean;
  toggle: (val: boolean) => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => toggle(e.target.checked)}
  />
);