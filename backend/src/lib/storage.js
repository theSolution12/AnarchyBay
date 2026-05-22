import { supabase } from "./supabase.js";

const BUCKET_NAME = "product-files";

export const generateUploadUrl = async (fileName, contentType, creatorId) => {
  const filePath = `${creatorId}/${Date.now()}-${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(filePath);

  if (error) {
    return { error };
  }

  return {
    data: {
      signedUrl: data.signedUrl,
      path: filePath,
      token: data.token,
    },
  };
};

export const generateDownloadUrl = async (filePath, expiresIn = 86400) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    return { error };
  }

  return { data: { signedUrl: data.signedUrl } };
};

export const deleteFileFromStorage = async (filePath) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  return { error };
};

export const getFileMetadata = async (filePath) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(filePath.split("/").slice(0, -1).join("/"), {
      search: filePath.split("/").pop(),
    });

  if (error) return { error };
  
  const file = data?.find(f => f.name === filePath.split("/").pop());
  return { data: file };
};

export const getPublicUrl = (filePath) => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
};
