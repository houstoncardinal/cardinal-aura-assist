const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

export interface ImageGenResult {
  url: string;
  revised_prompt?: string;
}

export async function generateImage({
  prompt,
  size = "1024x1024",
  quality = "standard",
}: {
  prompt: string;
  size?: string;
  quality?: string;
}): Promise<ImageGenResult> {
  const response = await fetch(IMAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ prompt, size, quality }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate image");
  }

  return response.json();
}
