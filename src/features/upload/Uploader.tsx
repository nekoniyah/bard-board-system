import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Loader2,
  X,
  FileImage,
  AlertCircle,
  CheckCircle2,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

// signatures fichiers
const FILE_SIGNATURES = {
  "image/jpeg": ["ffd8ff"],
  "image/png": ["89504e47"],
  "image/gif": ["47494638"],
  "image/webp": ["52494646"],
  "application/pdf": ["25504446"],
} as const;

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  sanitizedName: string;
  validatedType?: string;
}

interface UploaderProps {
  onImageUpload: (imageUrl: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  allowedMimeTypes?: string[];
}

// gen id secure
const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

// nettoyer nom
const sanitizeFileName = (fileName: string): string => {
  // retirer chemins
  const baseName = fileName.split(/[\/\\]/).pop() || "unnamed";

  // retirer chars dangereux
  const sanitized = baseName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, "_")
    .substring(0, 255);

  // pas de point debut
  return sanitized.startsWith(".") ? `file_${sanitized}` : sanitized;
};

// verif signature
const validateFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        resolve(false);
        return;
      }

      const arr = new Uint8Array(e.target.result as ArrayBuffer);
      const header = Array.from(arr.slice(0, 4))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      // verif correspondance
      const expectedSignatures =
        FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
      if (expectedSignatures) {
        const isValid = expectedSignatures.some((sig) =>
          header.startsWith(sig)
        );
        resolve(isValid);
      } else {
        // types non supportes ok par defaut
        resolve(true);
      }
    };

    reader.onerror = () => resolve(false);

    // lire 4 premiers octets
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 Octets";
  if (bytes === 0) return "0 Octets";
  const k = 1024;
  const sizes = ["Octets", "Ko", "Mo", "Go"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const Uploader: React.FC<UploaderProps> = ({
  onImageUpload,
  accept = "image/*",
  multiple = false,
  maxSize = 10,
  maxFiles = 10,
  className,
  allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const validateFile = useCallback(
    async (file: File): Promise<string | null> => {
      // verif taille
      const maxSizeBytes = maxSize * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `Le fichier "${sanitizeFileName(
          file.name
        )}" dépasse la taille maximale de ${maxSize}Mo`;
      }

      // verif fichier vide
      if (file.size === 0) {
        return `Le fichier "${sanitizeFileName(file.name)}" est vide`;
      }

      // verif type mime si defini
      if (
        allowedMimeTypes.length > 0 &&
        !allowedMimeTypes.includes(file.type)
      ) {
        return `Le fichier "${sanitizeFileName(
          file.name
        )}" n'est pas au bon format`;
      }

      // valider signature
      const isValidSignature = await validateFileSignature(file);
      if (!isValidSignature) {
        return `Le fichier "${sanitizeFileName(
          file.name
        )}" a un contenu qui ne correspond pas à son type`;
      }

      return null;
    },
    [maxSize, allowedMimeTypes]
  );

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      const validFiles: FileWithPreview[] = [];
      const newErrors: string[] = [];

      // limite nb fichiers
      if (files.length + newFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} fichiers autorisés`);
        newFiles = newFiles.slice(0, maxFiles - files.length);
      }

      // traiter avec limite
      const processPromises = newFiles.map(async (file, index) => {
        // delai anti surcharge
        await new Promise((resolve) => setTimeout(resolve, index * 50));

        const error = await validateFile(file);
        if (error) {
          newErrors.push(error);
          return null;
        }

        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: generateSecureId(),
          sanitizedName: sanitizeFileName(file.name),
          validatedType: file.type,
          preview: undefined, // defini plus tard
        });

        // apercu si image ok et < 5mo
        if (file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) {
          const previewUrl = URL.createObjectURL(file);
          previewUrlsRef.current.add(previewUrl);
          fileWithPreview.preview = previewUrl;
        }

        return fileWithPreview;
      });

      const processedFiles = await Promise.all(processPromises);
      const successfulFiles = processedFiles.filter(
        (f): f is FileWithPreview => f !== null
      );

      if (newErrors.length > 0) {
        setErrors(newErrors);
        setTimeout(() => setErrors([]), 5000);
      }

      if (successfulFiles.length > 0) {
        const updatedFiles = multiple
          ? [...files, ...successfulFiles]
          : successfulFiles;
        setFiles(updatedFiles);

        // upload simule limite concurrence
        const uploadQueue = [...successfulFiles];
        const concurrentUploads = 3;

        for (let i = 0; i < uploadQueue.length; i += concurrentUploads) {
          const batch = uploadQueue.slice(i, i + concurrentUploads);
          await Promise.all(batch.map((file) => simulateUpload(file.id)));
        }

        if (
          !multiple &&
          successfulFiles.length > 0 &&
          successfulFiles[0].preview
        ) {
          onImageUpload(successfulFiles[0].preview);
        }
      }
    },
    [files, maxFiles, multiple, validateFile, onImageUpload]
  );

  const simulateUpload = async (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsUploading(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
            setIsUploading(false);
            resolve();
          }, 500);
        }
      }, 100);
    });
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      processFiles(Array.from(fileList));

      // vider input pour reselect
      e.target.value = "";
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const fileList = e.dataTransfer.files;
      if (!fileList || fileList.length === 0) return;

      // filtrer non fichiers
      const files = Array.from(fileList).filter((file) => file.size > 0);
      processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // glisser si fichier
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // verif sortie zone depot
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragOver(false);
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);

      // nettoyer url apercu
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
        previewUrlsRef.current.delete(fileToRemove.preview);
      }

      const updatedFiles = prev.filter((f) => f.id !== fileId);
      return updatedFiles;
    });
  }, []);

  const clearAll = useCallback(() => {
    // nettoyer toutes urls
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();

    setFiles([]);
    setUploadProgress({});
  }, []);

  // nettoyage demontage
  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, []);

  return (
    <div
      className={cn("w-full max-w-3xl mx-auto relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute -inset-10 blur-3xl transition-all duration-700",
          isHovered ? "opacity-30" : "opacity-10"
        )}
      >
        <div
          className={cn(
            "absolute inset-x-20 top-0 h-48 bg-gradient-to-r from-neutral-500/30 via-neutral-400/30 to-neutral-500/30 animate-pulse",
            isHovered &&
              "from-neutral-400/40 via-neutral-300/40 to-neutral-400/40"
          )}
        />
      </div>
      <div
        className={cn(
          "relative p-[1px] rounded-3xl bg-gradient-to-b transition-all duration-500",
          isHovered
            ? "from-neutral-600/50 to-neutral-800/50"
            : "from-neutral-700/30 to-neutral-900/40"
        )}
      >
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/40 shadow-2xl hover:shadow-neutral-500/20 transition-all duration-500">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 via-transparent to-neutral-900/20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-neutral-800/10 to-transparent" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative px-10 pt-10 pb-4 z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative group">
                <div className="p-3.5 rounded-2xl bg-neutral-800/60 backdrop-blur-md border border-neutral-700/50 shadow-xl transition-all duration-300 group-hover:bg-neutral-800/80 group-hover:border-neutral-600/50">
                  <Upload className="h-6 w-6 text-neutral-300" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-neutral-700/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-100 tracking-tight">
                  Téléverser des fichiers
                </h3>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Glissez-déposez vos fichiers ici ou cliquez pour parcourir
                </p>
              </div>
            </div>
          </div>

          <div className="relative px-10 pb-10 space-y-6 z-10">
            {errors.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                <div className="relative p-5">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-1.5 rounded-lg bg-red-500/20 backdrop-blur">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-1 text-sm text-red-300/90">
                        {errors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="block w-1.5 h-1.5 rounded-full bg-red-400/60 mt-1.5 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer",
                "min-h-[260px] flex items-center justify-center",
                "bg-neutral-800/30 backdrop-blur-sm",
                isDragOver
                  ? "border-neutral-600 bg-neutral-800/50 scale-[1.01] shadow-2xl shadow-black/30"
                  : "border-neutral-700/60 hover:border-neutral-600 hover:bg-neutral-800/40 hover:shadow-xl",
                "focus-within:ring-2 focus-within:ring-neutral-600/30 focus-within:border-neutral-600"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-500",
                  isDragOver ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/20 via-neutral-800/10 to-transparent" />
                <div className="absolute inset-0 backdrop-blur-sm" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={
                  allowedMimeTypes.length > 0
                    ? allowedMimeTypes.join(",")
                    : accept
                }
                multiple={multiple}
                onChange={handleFileChange}
                className="sr-only focus-custom"
                aria-label="Sélection de fichier"
              />

              <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8 text-center">
                <div className="relative">
                  <div
                    className={cn(
                      "relative p-6 rounded-3xl transition-all duration-500",
                      "bg-neutral-800/50 backdrop-blur-md border border-neutral-700/50",
                      "shadow-xl",
                      isDragOver
                        ? "scale-110 bg-neutral-700/60 border-neutral-600 shadow-2xl shadow-black/40"
                        : "group-hover:scale-105 group-hover:bg-neutral-800/70 group-hover:border-neutral-600 group-hover:shadow-2xl"
                    )}
                  >
                    <Upload
                      className={cn(
                        "relative h-10 w-10 transition-all duration-300",
                        isDragOver
                          ? "text-neutral-200"
                          : "text-neutral-400 group-hover:text-neutral-300"
                      )}
                    />
                  </div>
                  {isDragOver && (
                    <div className="absolute inset-0 rounded-3xl bg-neutral-600/20 animate-ping" />
                  )}
                </div>

                <div className="space-y-2">
                  <p
                    className={cn(
                      "text-lg font-medium transition-all duration-300",
                      isDragOver
                        ? "text-neutral-100 scale-105"
                        : "text-neutral-200"
                    )}
                  >
                    {isDragOver
                      ? "Déposez les fichiers ici"
                      : "Déposez les fichiers ici ou cliquez pour parcourir"}
                  </p>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {accept === "image/*"
                      ? "PNG, JPG, GIF"
                      : "Tous types de fichiers"}{" "}
                    jusqu'à {maxSize}Mo
                    {multiple && (
                      <>
                        <br />
                        <span className="text-xs">
                          Maximum {maxFiles} fichiers
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
                    "bg-neutral-800/60 hover:bg-neutral-700/60 backdrop-blur-md",
                    "border border-neutral-700/50 hover:border-neutral-600/50",
                    "text-neutral-200 hover:text-neutral-100",
                    "shadow-xl hover:shadow-2xl hover:scale-105",
                    "focus:outline-none focus:ring-2 focus:ring-neutral-600/30"
                  )}
                >
                  <FileImage className="h-4 w-4" />
                  Sélectionner des fichiers
                </button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-500 animate-pulse" />
                    <p className="text-sm font-medium text-neutral-300">
                      {files.length}{" "}
                      {files.length === 1
                        ? "fichier sélectionné"
                        : "fichiers sélectionnés"}
                    </p>
                  </div>
                  <button
                    onClick={clearAll}
                    disabled={isUploading}
                    className={cn(
                      "text-xs text-neutral-500 hover:text-neutral-400 transition-all duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Tout effacer
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                  {files.map((file, index) => {
                    const progress = uploadProgress[file.id];
                    const isCompleted = progress === undefined && !isUploading;

                    return (
                      <div
                        key={file.id}
                        className="group relative overflow-hidden rounded-2xl bg-neutral-800/40 border border-neutral-700/40 backdrop-blur-md hover:bg-neutral-800/60 hover:border-neutral-600/40 transition-all duration-300 animate-slide-in hover:shadow-xl"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {progress !== undefined && (
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-neutral-700/30 to-neutral-800/20 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        )}

                        <div className="relative flex items-center gap-4 p-4">
                          <div className="flex-shrink-0">
                            {file.preview ? (
                              <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-neutral-700/50 shadow-lg">
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                              </div>
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-800/60 backdrop-blur border border-neutral-700/50">
                                <File className="h-6 w-6 text-neutral-500" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-neutral-200 truncate">
                                {file.sanitizedName}
                              </p>
                              {isCompleted && (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-green-500/20 backdrop-blur border border-green-500/30 text-xs text-green-300">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Téléversé
                                </div>
                              )}
                              {progress !== undefined && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/50 backdrop-blur border border-neutral-700/50 text-xs text-neutral-400">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  {progress}%
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500">
                              {formatFileSize(file.size)}
                            </p>
                            {progress !== undefined && (
                              <div className="mt-2 h-1.5 bg-neutral-800/50 backdrop-blur rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-neutral-600 to-neutral-700 transition-all duration-500 shadow-sm"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeFile(file.id)}
                            disabled={progress !== undefined}
                            className={cn(
                              "flex-shrink-0 p-2 rounded-xl transition-all duration-300",
                              "text-neutral-500 hover:text-neutral-400 hover:bg-neutral-800/50",
                              "disabled:opacity-30 disabled:cursor-not-allowed",
                              "focus:outline-none focus:ring-2 focus:ring-neutral-600/20"
                            )}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {files.length > 0 &&
              !isUploading &&
              Object.keys(uploadProgress).length === 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative overflow-hidden rounded-2xl bg-green-500/10 backdrop-blur-md border border-green-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                    <div className="relative p-5">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="p-2.5 rounded-xl bg-green-500/20 backdrop-blur border border-green-500/30">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-300">
                            Tous les fichiers ont été téléversés avec succès !
                          </p>
                          <p className="text-xs text-green-400/70 mt-0.5">
                            Prêt à passer à l'étape suivante
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!multiple && files[0]?.preview && (
                    <button
                      onClick={() => onImageUpload(files[0].preview!)}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl text-base font-medium transition-all duration-300",
                        "bg-neutral-200 hover:bg-neutral-100 backdrop-blur",
                        "text-neutral-900 shadow-2xl hover:shadow-neutral-500/20 hover:scale-[1.02]",
                        "border border-neutral-300/50",
                        "focus:outline-none focus:ring-2 focus:ring-neutral-400/40"
                      )}
                    >
                      Continuer vers l'éditeur →
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
