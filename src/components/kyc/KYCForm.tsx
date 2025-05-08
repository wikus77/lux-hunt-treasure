
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, FileText, FileImage, User, Upload, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_DOCUMENT_TYPES = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];

// Define form validation schema
const kycFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Il nome completo deve contenere almeno 2 caratteri",
  }),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    now.setFullYear(now.getFullYear() - 18); // Must be at least 18 years old
    return date <= now;
  }, {
    message: "Devi avere almeno 18 anni",
  }),
  idDocument: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Documento d'identità richiesto")
    .refine(
      (files) => files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      "La dimensione massima è 5MB"
    )
    .refine(
      (files) => 
        files.length === 0 || 
        ACCEPTED_DOCUMENT_TYPES.includes(files[0].type),
      "Formato supportato: .pdf, .jpg, .jpeg, o .png"
    ),
  selfie: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Selfie richiesto")
    .refine(
      (files) => files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      "La dimensione massima è 5MB"
    )
    .refine(
      (files) => 
        files.length === 0 || 
        ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Formato supportato: .jpg, .jpeg, o .png"
    ),
});

type KycFormValues = z.infer<typeof kycFormSchema>;

interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
  isPdf?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, isPdf = false }) => {
  if (!file) return null;
  
  return (
    <div className="relative mt-2 p-2 border border-white/20 rounded-md bg-black/30">
      <div className="flex items-center gap-2">
        {isPdf ? (
          <FileText className="h-6 w-6 text-white/70" />
        ) : (
          <div className="w-14 h-14 rounded overflow-hidden">
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 truncate">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-white/60">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
        </div>
        <button 
          type="button"
          onClick={onRemove}
          className="p-1 rounded-full bg-black/50 hover:bg-red-900/50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const KYCForm: React.FC = () => {
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<KycFormValues>({
    resolver: zodResolver(kycFormSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
    },
  });

  const handleIdDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdDocumentFile(e.target.files[0]);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: KycFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Here we would integrate with KYC provider like Sumsub, Veriff or Onfido
      console.log("KYC form data:", {
        ...data, 
        idDocument: idDocumentFile,
        selfie: selfieFile
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Verifica identità inviata con successo", {
        description: "Ti contatteremo appena completata la verifica."
      });
      
      // Reset form
      form.reset();
      setIdDocumentFile(null);
      setSelfieFile(null);
      
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error("Si è verificato un errore", {
        description: "Non è stato possibile inviare la verifica. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPdf = idDocumentFile?.type === "application/pdf";

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card border border-white/10 bg-black/50 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-lg"
      >
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Verifica della tua identità
          </h2>
          <p className="text-white/70">
            Per garantire la massima sicurezza del gioco, abbiamo bisogno di verificare la tua identità.
            Le informazioni fornite saranno trattate in conformità con la nostra politica sulla privacy.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
                      <Input 
                        placeholder="Inserisci nome e cognome" 
                        className="pl-10 bg-black/40 border-white/20 text-white" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Data di nascita</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-5 w-5" />
                      <Input 
                        type="date" 
                        className="pl-10 bg-black/40 border-white/20 text-white" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-white/50">
                    Devi avere almeno 18 anni per partecipare.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idDocument"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-white">Documento d'identità</FormLabel>
                  <FormControl>
                    <>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          id="id-document-upload"
                          onChange={(e) => {
                            onChange(e.target.files);
                            handleIdDocumentChange(e);
                          }}
                          {...fieldProps}
                        />
                        <label
                          htmlFor="id-document-upload"
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-white/30 rounded-md cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <Upload className="h-6 w-6 text-purple-400" />
                          <span className="text-white/80">
                            Carica carta d'identità, patente o passaporto
                          </span>
                        </label>
                      </div>
                      {idDocumentFile && (
                        <FilePreview 
                          file={idDocumentFile} 
                          onRemove={() => {
                            setIdDocumentFile(null);
                            onChange(null);
                          }}
                          isPdf={isPdf}
                        />
                      )}
                    </>
                  </FormControl>
                  <FormDescription className="text-white/50">
                    Formati accettati: JPG, PNG, PDF. Max 5MB.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selfie"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-white">Selfie con documento</FormLabel>
                  <FormControl>
                    <>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          className="hidden"
                          id="selfie-upload"
                          onChange={(e) => {
                            onChange(e.target.files);
                            handleSelfieChange(e);
                          }}
                          {...fieldProps}
                        />
                        <label
                          htmlFor="selfie-upload"
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-white/30 rounded-md cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          <FileImage className="h-6 w-6 text-cyan-400" />
                          <span className="text-white/80">
                            Carica una foto di te con il documento
                          </span>
                        </label>
                      </div>
                      {selfieFile && (
                        <FilePreview 
                          file={selfieFile} 
                          onRemove={() => {
                            setSelfieFile(null);
                            onChange(null);
                          }}
                        />
                      )}
                    </>
                  </FormControl>
                  <FormDescription className="text-white/50">
                    Il tuo volto e il documento devono essere chiaramente visibili.
                  </FormDescription>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin"></div>
                    <span>Invio in corso...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Invia per verifica</span>
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-center text-white/50 mt-6">
              Cliccando su "Invia per verifica", accetti che i tuoi dati vengano elaborati per la verifica dell'identità in conformità con la nostra <a href="/privacy" className="text-cyan-400 hover:underline">Politica sulla Privacy</a>.
            </p>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default KYCForm;
