"use client";

import { MainImage } from "@/api/homeSettings";

interface SelectedProduct {
  id: number;
  name: string;
  slug: string;
}

type DraggableItem = MainImage | SelectedProduct;

interface DraggableListProps {
  items: DraggableItem[];
  draggedIndex: number | null;
  hint: string;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
}

export default function DraggableList({
  items,
  draggedIndex,
  hint,
  onDragStart,
  onDrop,
}: DraggableListProps) {
  // 아이템 이름 추출
  const getDisplayName = (item: DraggableItem): string => {
    if ("url" in item) {
      return item.altKo || item.alt || "이미지";
    }
    return item.name;
  };

  // 아이템 키 추출
  const getItemKey = (item: DraggableItem): string | number => {
    if ("url" in item) {
      return item.url;
    }
    return item.id;
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] border border-[#D4D4D4] rounded-lg pt-[16px] h-fit">
      <p className="text-blue-500 text-sm px-[16px] py-[12px]">{hint}</p>

      {items.length > 0 && (
        <div className="">
          {items.map((item, index) => (
            <div
              key={getItemKey(item)}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              className={`bg-[#F5F5F5] border border-gray-200 p-3 flex items-center gap-3 cursor-move hover:bg-gray-50 transition-colors ${
                draggedIndex === index ? "opacity-50" : ""
              }`}
            >
              {/* 드래그 핸들 */}
              <div className="text-gray-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 아이템 이름 */}
              <span className="text-sm text-gray-700 truncate">
                {getDisplayName(item)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
