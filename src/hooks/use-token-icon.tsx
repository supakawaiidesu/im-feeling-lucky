// TokenIcon.tsx
import Image from "next/image";
import { useState, useEffect } from "react";

// Cache object to store image paths
const imagePathCache: Record<string, string> = {};

export const useTokenImagePath = (pair: string) => {
  const [imagePath, setImagePath] = useState<string | null>(
    imagePathCache[pair] || null
  );

  useEffect(() => {
    const findImagePath = async () => {
      if (imagePathCache[pair]) {
        setImagePath(imagePathCache[pair]);
        return;
      }

      const fileName = pair.replace("/", "-");
      const extensions = ['svg', 'webp', 'png'] as const;
      
      for (const ext of extensions) {
        const path = `/static/images/tokens/${fileName}.${ext}`;
        try {
          const response = await fetch(path, { method: 'HEAD' });
          if (response.ok) {
            imagePathCache[pair] = path;
            setImagePath(path);
            return;
          }
        } catch {
          continue;
        }
      }
      
      setImagePath(null);
    };

    if (!imagePathCache[pair]) {
      findImagePath();
    }
  }, [pair]);

  return imagePath;
};

export const TokenIcon = ({ pair }: { pair: string }) => {
  const imagePath = useTokenImagePath(pair);

  if (!imagePath) {
    const baseToken = pair.split("/")[0];
    return (
      <div className="flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-muted">
        {baseToken[0]}
      </div>
    );
  }

  return (
    <div className="relative w-6 h-6">
      <Image
        src={imagePath}
        alt={`${pair} icon`}
        width={24}
        height={24}
        className="rounded-full"
      />
    </div>
  );
};

export const TokenPairDisplay = ({ pair }: { pair: string }) => {
  return (
    <div className="flex items-center gap-2">
      <TokenIcon pair={pair} />
      <span>{pair}</span>
    </div>
  );
};

// PrefetchTokenImages component to handle pre-fetching
export const PrefetchTokenImages = ({ pairs }: { pairs: string[] }) => {
  useEffect(() => {
    pairs.forEach(pair => {
      if (!imagePathCache[pair]) {
        const fileName = pair.replace("/", "-");
        const extensions = ['svg', 'webp', 'png'] as const;
        
        extensions.forEach(ext => {
          const path = `/static/images/tokens/${fileName}.${ext}`;
          fetch(path, { method: 'HEAD' })
            .then(response => {
              if (response.ok && !imagePathCache[pair]) {
                imagePathCache[pair] = path;
              }
            })
            .catch(() => {
              // Ignore errors - will try next extension
            });
        });
      }
    });
  }, [pairs]);

  return null; // This component doesn't render anything
};