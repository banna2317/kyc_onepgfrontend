<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import {
    ChevronLeft, ChevronRight, User, Building, FileText, Shield,
    CheckCircle, Phone, Mail, Loader2, Key, Eye, EyeOff, X
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { z } from "zod";
import { useToast } from "../hooks/use-toast";
import { useAuthStore } from "@/stores/auth";
const { toast } = useToast();
const auth = useAuthStore();
import axios from "../axios";
const step1Schema = z.object({
    merchantName: z.string().min(2, "Merchant name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.coerce
        .string()
        .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    otp: z.string().optional(),
    emailOtp: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const step2Schema = z.object({
    businessType: z.string().optional(),
    gstin: z.string().optional(),
});

// Step 3 validation is handled manually via boolean flags in this logic

const step4Schema = z.object({
    website: z.string().optional(),
    services: z.string().optional(),
    useCase: z.string().optional(),
    termsAccepted: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions"
    }),
});

// --- State Management ---
const router = useRouter();
const currentStep = ref(1);
const isLoading = ref(false);
const isLoading1 = ref(false);
const userdetail = ref(null);
// OTP & Verification States
const otpSent = ref(false);
const emailOtpSent = ref(false);
const otpVerified = ref(false);
const emailOtpVerified = ref(false);
const countryCode = ref("+91");

// Dialog States (Modals)
const otpDialogOpen = ref(false);
const emailOtpDialogOpen = ref(false);
const panDialogOpen = ref(false);
const aadhaarDialogOpen = ref(false);
const bankDialogOpen = ref(false);

// Password Visibility
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Verification Statuses
const gstinVerified = ref(false);
const gstinVerifying = ref(false);
const panVerified = ref(false);
const aadhaarVerified = ref(false);
const bankVerified = ref(false);
const isVerifying = ref(false);
const isSubmitting = ref(false);
const ImageUrl = ref('http://127.0.0.1:8000/storage/');
// --- Reactive Forms ---
const form1 = reactive({
    merchantName: "",
    email: "",
    phone: "",
    otp: "",
    emailOtp: "",
    password: "",
    confirmPassword: "",
});

const form2 = reactive({
    businessType: "",
    gstin: "",
});

const form3 = reactive({

    accountNumber: "",
    ifscCode: "",
    accountHolderName: ""
});

const form4 = reactive({
    website: "",
    services: "",
    useCase: "",
    termsAccepted: false,
});

// Error States
const errors = reactive<Record<string, string>>({});

// --- Helper Functions ---

// Simple Toast Simulation
const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    // In a real app, use a library like vue-toastification or sonner
    alert(`${title}\n${description}`);
};


const steps = [
    { number: 1, title: "Basic Information", icon: User },
    { number: 2, title: "Business Details", icon: Building },
    { number: 3, title: "Document Verification", icon: FileText },
    { number: 4, title: "Business Information", icon: Building },
    { number: 5, title: "Verification", icon: Shield },
    { number: 6, title: "Review & Submit", icon: CheckCircle }
];



const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const progressPercentage = computed(() => (currentStep.value / steps.length) * 100);
// new


const sendEmailOTP = async () => {
    if (!form1.email) {
        toast({
            title: "Error",
            description: "Please enter email address",
            variant: "destructive",
        });
        // showToast("Error", "Please enter email address", "destructive");
        return;
    }
    isLoading.value = true;
    try {
        console.log(form1.email);

        const response = await axios.post("/send-email-otp", {
            email: form1.email,
        });

        if (response.data.success) {
            setTimeout(() => {
                emailOtpSent.value = true;
                isLoading.value = false;
                toast({
                    title: "Success",
                    description: `Please check your email for the OTP. ${response.data.otp}`,
                    variant: "default",
                });

            }, 1500);
        } else {
            toast({
                title: "Error",
                description: "Failed to send OTP. Please try again.",
                variant: "destructive",
            });
        }

    } catch (err) {

        let message = 'Something went wrong. Please try again.'

        if (err.response) {
            // Backend se message aaya ho
            message = err.response.data?.message || message
        } else if (err.message) {
            // Network / JS error
            message = err.message
        }

        toast({
            title: "Error",
            description: message,
            variant: "destructive", // ❌ error ke liye
        })

    } finally {
        isLoading.value = false;
        isLoading1.value = false;
    }
};

async function verifyEmailOTP() {
    console.log(form1.emailOtp);

    if (form1.emailOtp && form1.emailOtp.length === 6) {


        try {
            isLoading.value = true;

            const response = await axios.post("/submit-email-otp", {
                email: form1.email,
                emailOtp: form1.emailOtp,
            });

            if (response.data.success) {
                setTimeout(() => {
                    emailOtpVerified.value = true;
                    emailOtpDialogOpen.value = false;

                    toast({
                        title: "Success",
                        description: "OTP verified successfully",
                        variant: "default",
                    });

                }, 1500);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send OTP. Please try again.",
                    variant: "destructive",
                });
            }

        } catch (err) {
            let message = "Something went wrong. Please try again.";

            if (err.response) {
                // backend se error
                message = err.response.data.message || message;
            } else if (err.request) {
                // request gaya but response nahi aaya
                message = "Server not responding. Please try later.";
            } else {
                // JS / network error
                message = err.message;
            }

            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });

        } finally {
            isLoading.value = false;
        }

    } else {
        toast({
            title: "Error",
            description: "Please enter a valid 6-digit OTP",
            variant: "destructive",
        });

    }
};


const sendOTP = async () => {
    if (!form1.phone) {
        toast({
            title: "Error",
            description: "Please enter phone number",
            variant: "destructive",
        });

        return;
    }
    if (form1.phone.length < 10) {
        toast({
            title: "Error",
            description: "Please enter a valid phone number",
            variant: "destructive",
        });

        return;
    }
    isLoading.value = true;

    const numberToSend = countryCode.value + form1.phone;

    try {

        const response = await axios.post("/send-phone-otp", {
            phone: numberToSend,
        });

        if (response.data.success) {
            setTimeout(() => {
                otpSent.value = true;
                isLoading.value = false;
                toast({
                    title: "Success",
                    description: `Please check your phone for the OTP. ${response.data.otp}`,
                    variant: "default",
                });

            }, 1500);
        } else {
            toast({
                title: "Error",
                description: "Failed to send OTP. Please try again.",
                variant: "destructive",
            });
        }

    } catch (err) {

        let message = "Something went wrong. Please try again.";

        if (err.response) {
            // backend se error
            message = err.response.data.message || message;
        } else if (err.request) {
            // request gaya but response nahi aaya
            message = "Server not responding. Please try later.";
        } else {
            // JS / network error
            message = err.message;
        }

        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });

    } finally {
        isLoading.value = false;
        isLoading1.value = false;
    }


};



async function verifyPhoneOTP() {
    if (form1.otp && form1.otp.length === 6) {
        isLoading.value = true;
        try {

            const numberToSend = countryCode.value + form1.phone;
            const response = await axios.post("/submit-phone-otp", {
                phone: numberToSend,
                phoneOtp: form1.otp,
            });
            console.log(response);

            if (response.data.success) {
                setTimeout(() => {
                    otpVerified.value = true;
                    otpDialogOpen.value = false;

                    toast({
                        title: "Success",
                        description: "OTP verified successfully",
                        variant: "default",
                    });

                }, 1500);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send OTP. Please try again.",
                    variant: "destructive",
                });
            }

        } catch (err) {

            let message = "Something went wrong. Please try again.";

            if (err.response) {
                // backend se error
                message = err.response.data.message || message;
            } else if (err.request) {
                // request gaya but response nahi aaya
                message = "Server not responding. Please try later.";
            } else {
                // JS / network error
                message = err.message;
            }

            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });

        } finally {
            isLoading.value = false;
        }




        // showToast("Success", "Phone number verified successfully");
    } else {
        toast({
            title: "Error",
            description: "Please enter a valid 6-digit OTP",
            variant: "destructive",
        });

    }
};
const validateForm = (schema: z.ZodSchema, data: any) => {
    const result = schema.safeParse(data);
    // Clear previous errors for this step
    Object.keys(data).forEach(key => delete errors[key]);

    if (!result.success) {
        result.error.issues.forEach((issue) => {
            const field = issue.path[0];
            console.log('ds', issue);

            errors[field as string] = issue.message;
        });
        return false;
    }
    return true;
};

// new

const panFile = ref<File | null>(null)
const panPreview = ref<string | null>(null)
const panFileName = ref('')

const panInputRef = ref<HTMLInputElement | null>(null)
const aadhaarFront = ref<File | null>(null)
const aadhaarBack = ref<File | null>(null)

const aadhaarFrontPreview = ref<string | null>(null)
const aadhaarBackPreview = ref<string | null>(null)

// FRONT
const onAadhaarFrontChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    aadhaarFront.value = file
    aadhaarFrontPreview.value = URL.createObjectURL(file)
}

const aadhaarfrontUrl = computed(() => {
    if (!aadhaarFrontPreview.value) return ''

    if (
        aadhaarFrontPreview.value.startsWith('blob:') ||
        aadhaarFrontPreview.value.startsWith('data:')
    ) {
        return aadhaarFrontPreview.value
    }

    return ImageUrl.value + aadhaarFrontPreview.value
})


const removeAadhaarFront = async () => {
    try {

        if (
            aadhaarFrontPreview.value &&
            !aadhaarFrontPreview.value.startsWith('blob:') &&
            !aadhaarFrontPreview.value.startsWith('data:')
        ) {
            await axios.post('/user-aadhaar-remov')

            aadhaarBack.value = null
            aadhaarBackPreview.value = null
            getuserdetail();
        }


        aadhaarFront.value = null
        aadhaarFrontPreview.value = null



    } catch (error) {
        console.error('Aadhaar front remove failed', error)
        alert('Aadhaar front image remove nahi ho payi')
    }
}
const removeAadhaarBack = async () => {
    try {

        if (
            aadhaarBackPreview.value &&
            !aadhaarBackPreview.value.startsWith('blob:') &&
            !aadhaarBackPreview.value.startsWith('data:')
        ) {
            await axios.post('/user-aadhaar-remov')
            aadhaarFront.value = null
            aadhaarFrontPreview.value = null
            getuserdetail();
        }

        // 🧹 Frontend reset
        aadhaarBack.value = null
        aadhaarBackPreview.value = null




    } catch (error) {
        console.error('Aadhaar back remove failed', error)
        alert('Aadhaar back image remove nahi ho payi')
    }
}


// BACK
const onAadhaarBackChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    aadhaarBack.value = file
    aadhaarBackPreview.value = URL.createObjectURL(file)
}

const aadhaarbackUrl = computed(() => {
    if (!aadhaarBackPreview.value) return ''

    if (
        aadhaarBackPreview.value.startsWith('blob:') ||
        aadhaarBackPreview.value.startsWith('data:')
    ) {
        return aadhaarBackPreview.value
    }

    return ImageUrl.value + aadhaarBackPreview.value
})



const handlePanFile = (e: Event) => {
    const input = e.target as HTMLInputElement
    if (!input.files || !input.files[0]) return

    const file = input.files[0]
    panFile.value = file
    panFileName.value = file.name


    panPreview.value = URL.createObjectURL(file)

}
const panPreviewUrl = computed(() => {
    if (!panPreview.value) return ''

    if (
        panPreview.value.startsWith('blob:') ||
        panPreview.value.startsWith('data:')
    ) {
        return panPreview.value
    }

    return ImageUrl.value + panPreview.value
})
const removePanFile = async () => {
    try {
        if (
            panPreview.value &&
            !panPreview.value.startsWith('blob:') &&
            !panPreview.value.startsWith('data:')
        ) {
            await axios.post('/user-pan-remuv')

            panVerified.value = false;

            getuserdetail();

        }
        panFile.value = null
        panPreview.value = null
        panFileName.value = ''

        if (panInputRef.value) {
            panInputRef.value.value = ''
        }

    } catch (error) {
        console.error('PAN remove failed', error)
        alert('PAN image remove nahi ho payi')
    }
}



const verifyPan = async () => {
    if (!panFile.value) return
    isLoading.value = true;
    try {
        const formData = new FormData()
        formData.append('pan_image', panFile.value)

        const response = await axios.post(
            '/user-verifypan',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        panDialogOpen.value = false;
        getuserdetail();
        toast({
            title: 'Success',
            description: response.data.message || 'PAN verified successfully',
            variant: 'default',
        })

    } catch (error: any) {


        let message = 'Something went wrong'

        if (error.response?.data?.message) {
            message = error.response.data.message
        } else if (error.response?.data?.error) {
            message = error.response.data.error
        }

        toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
        })

    } finally {
        isLoading.value = false;
    }
}


const verifyAadhaar = async () => {
    if (!aadhaarFront.value) return
    if (!aadhaarBack.value) return
    isLoading.value = true;

    try {
        const formData = new FormData()
        formData.append('aadhar_front', aadhaarFront.value);
        formData.append('aadhar_back', aadhaarBack.value);

        const response = await axios.post(
            '/user-verifyaadhar',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        aadhaarDialogOpen.value = false;
        getuserdetail();
        toast({
            title: 'Success',
            description: response.data.message || 'Aadhaar verified successfully',
            variant: 'default',
        })

    } catch (error: any) {


        let message = 'Something went wrong'

        if (error.response?.data?.message) {
            message = error.response.data.message
        } else if (error.response?.data?.error) {
            message = error.response.data.error
        }

        toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
        })

    } finally {
        isLoading.value = false;
    }
};

const verifyBank = async () => {

    isLoading.value = true;

    try {
        const formData = new FormData()
        formData.append('account_number', form3.accountNumber);
        formData.append('ifsc_code', form3.ifscCode);
        formData.append('holder_name', form3.accountHolderName);

        const response = await axios.post(
            '/user-verifyaccount',
            formData,
        )

        if (response.data.status === true) {
            bankDialogOpen.value = false;
            getuserdetail();
            toast({
                title: 'Success',
                description: response.data.message || 'Bank account verified successfully',
                variant: 'default',
            })
        }




    } catch (error: any) {


        let message = 'Something went wrong'

        if (error.response?.data?.message) {
            message = error.response.data.message
        } else if (error.response?.data?.error) {
            message = error.response.data.error
        }

        toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
        })

    } finally {
        isLoading.value = false;
    }



};

// new

const nextStep = async () => {
    if (currentStep.value === 1) {

        const isValid = validateForm(step1Schema, form1);

        if (!isValid) return;
        console.log('okk');
        const numberToSend = countryCode.value + form1.phone;
        await auth.signUp(form1.merchantName, form1.email, numberToSend, form1.password);
        getuserdetail();
    } else if (currentStep.value === 2) {
        verifyGSTIN();
        return;

    } else if (currentStep.value === 3) {
        verifydocuments();
        return;
    } else if (currentStep.value === 4) {
        // Optional step validation skipped

        businessInformation();
        return;


    } else if (currentStep.value === 5) {
        if (!isVerifying.value) {
            currentStep.value = 6;
            return;
        }
    } else if (currentStep.value === 6) {
        submitApplication();
        return;
    }

    // Handle Step 5 automatic transition
    if (currentStep.value === 4) {
        currentStep.value = 5;
        isVerifying.value = true;
        setTimeout(() => {
            isVerifying.value = false;
            showToast("Verification Complete", "All documents verified successfully");
            currentStep.value = 6;
        }, 3000);
        return;
    }

    currentStep.value++;
};

watch(
    () => form1.phone,
    (newVal, oldVal) => {
        if (oldVal && newVal !== oldVal) {
            otpVerified.value = false;
        }
    }
);
watch(
    () => form1.email,
    (newVal, oldVal) => {
        if (oldVal && newVal !== oldVal) {
            emailOtpVerified.value = false;
        }
    }
);

const verifyGSTIN = async () => {
    if (!form2.businessType) {

        toast({
            title: "Error",
            description: "Please select business type",
            variant: "destructive",
        });
        return;
    }
    if (!form2.gstin || form2.gstin.length !== 15) {

        toast({
            title: "Error",
            description: "Please enter a valid 15-character GSTIN",
            variant: "destructive",
        });
        return;
    }


    isLoading.value = true;
    try {

        const response = await axios.post("/user-verified-gstin", {
            gstin: form2.gstin,
            business_type: form2.businessType,
        });

        if (response.data.status) {
            setTimeout(() => {
                otpSent.value = true;
                isLoading.value = false;
                toast({
                    title: "Success",
                    description: response.data.message,
                    variant: "default",
                });

            }, 1500);

            currentStep.value = 3;

        } else {
            toast({
                title: "Error",
                description: "Failed Please try again.",
                variant: "destructive",
            });
        }

    } catch (err) {

        let message = "Something went wrong";

        if (err.response) {
            // backend error
            message = err.response.data.message || message;
        } else if (err.request) {
            // request gaya, response nahi
            message = "Server not responding. Please try later.";
        } else {
            // JS error
            message = err.message;
        }

        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });

    } finally {
        isLoading.value = false;
    }

};


const getuserdetail = async () => {
    try {
        const response = await axios.post("/getuserdetail");
        if (response.data.status === true) {

            currentStep.value = response.data.step;

            if (response.data.data.pancard_number && response.data.data.pancard_name && response.data.data.dob) {
                panVerified.value = true;
                panPreview.value = response.data.data.pancard_image;

            }
            if (response.data.data.aadhaar_number && response.data.data.aadhaar_name) {
                aadhaarVerified.value = true;
                aadhaarBackPreview.value = response.data.data.aadhaar_back_image;
                aadhaarFrontPreview.value = response.data.data.aadhaar_front_image;
            }

            if (response.data.data.account_number && response.data.data.ifsc_code && response.data.data.holder_name) {
                bankVerified.value = true;
            }

            // bankDialogOpen.value = false;
            if (response.data.step === 6) {
                userdetail.value = response.data.data;
            }

        }
    } catch (error: any) {
        console.error(error.response?.data?.message || error.message || "API call failed");
    }
};
const getuser = async () => {
    try {
        const response = await axios.post("/user");
        if (response.data.status === true) {
            currentStep.value = 2;
        }
    } catch (error: any) {
        console.error(error.response?.data?.message || error.message || "API call failed");
    }
};
const businessInformation = async () => {

    if (!form4.website) {
        toast({
            title: "Error",
            description: "Please enter website",
            variant: "destructive",
        });
        return;
    }

    if (!form4.services) {
        toast({
            title: "Error",
            description: "Please enter services",
            variant: "destructive",
        });
        return;
    }

    if (!form4.useCase) {
        toast({
            title: "Error",
            description: "Please enter use case",
            variant: "destructive",
        });
        return;
    }

    try {
        const response = await axios.post("/user-BusinessInformation", {
            website_url: form4.website,
            services_products_offered: form4.services,
            use_case_for_kyc_api: form4.useCase,
        });
        if (response.data.status === true) {

            toast({
                title: "Success",
                description: response.data.message,
                variant: "default",
            });

            getuserdetail();

        }
    } catch (error: any) {
        console.error(error.response?.data?.message || error.message || "API call failed");
        toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "API call failed",
            variant: "destructive",
        });
    }
};

const submitApplication = async () => {

    try {
        const response = await axios.post("/user-termsAccepted", { i_agree: form4.termsAccepted });
        if (response.data.status === true) {
            toast({
                title: "Success",
                description: response.data.message,
                variant: "default",
            });
            router.push("/app");

        }
    } catch (error: any) {

        toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "API call failed",
            variant: "destructive",
        });
    }
};

const verifydocuments = async () => {

    // ✅ All documents must be verified
    if (!panVerified.value || !aadhaarVerified.value || !bankVerified.value) {
        toast({
            title: "Verification Incomplete",
            description: "Please verify PAN, Aadhaar and Bank account",
            variant: "destructive",
        });
        return;
    }

    try {
        const response = await axios.post("/user-verifydocuments");

        if (!response.data.status) {

            // Show backend missing documents
            let message = response.data.message || "Verification failed";

            if (response.data.missing_documents) {
                message = `Missing: ${response.data.missing_documents.join(", ")}`;
            }

            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });

            return;
        }

        toast({
            title: "Verification Completed",
            description: response.data.message,
            variant: "default",
        });
        currentStep.value = 4;

        // ✅ Optional: move to next step
        // currentStep.value++

    } catch (error) {

        toast({
            title: "Server Error",
            description: error.response?.data?.message || "Something went wrong",
            variant: "destructive",
        });
    }
};

const resendEmailOTP = async () => {
    form1.emailOtp = ""; // clear old OTP
    isLoading1.value = true;
    await sendEmailOTP();
};
const resendOTP = async () => {
    form1.otp = ""   // clear old otp
     isLoading1.value = true;
    await sendOTP()
}
onMounted(async () => {
    await getuser();

    if (currentStep.value === 2) {
        getuserdetail();
    }
});
</script>

<template>
    <div class="min-h-screen pt-24 pb-12 bg-muted/20 text-slate-900 dark:text-slate-100">
        <div class="container mx-auto px-4 max-w-4xl">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold mb-4">Merchant Onboarding</h1>
                <p class="text-lg text-muted-foreground text-slate-500">
                    Complete your merchant verification to start accepting payments
                </p>
            </div>

            <div class="mb-8">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium">Progress</span>
                    <span class="text-sm text-slate-500">{{ currentStep }} of {{ steps.length }}</span>
                </div>
                <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div class="h-full bg-primary bg-blue-600 transition-all duration-300"
                        :style="{ width: `${progressPercentage}%` }"></div>
                </div>
            </div>

            <div class="flex items-center justify-between mb-12 overflow-x-auto pb-4">
                <div v-for="step in steps" :key="step.number" class="flex flex-col items-center min-w-0 flex-1 px-2">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2 transition-colors"
                        :class="currentStep >= step.number ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'">
                        <component :is="step.icon" class="h-5 w-5" />
                    </div>
                    <span class="text-xs font-medium text-center whitespace-nowrap"
                        :class="currentStep >= step.number ? 'text-blue-600' : 'text-slate-400'">
                        {{ step.title }}
                    </span>
                </div>
            </div>

            <div class="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-8 mb-8">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold mb-2">Step {{ currentStep }}: {{ steps[currentStep - 1].title }}</h2>
                </div>

                <div v-if="currentStep === 1" class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Merchant Name *</label>
                        <input v-model="form1.merchantName" type="text"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Enter merchant name" />
                        <p v-if="errors.merchantName" class="text-sm text-red-500">{{ errors.merchantName }}</p>
                    </div>

                    <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                            <Mail class="h-4 w-4" /> Email Verification
                        </h3>
                        <label class="text-sm font-medium">Email Address *</label>
                        <div class="flex gap-2 mt-1">
                            <div class="flex-1 relative">
                                <input v-model="form1.email" type="email"
                                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Enter email address" />
                                <div v-if="emailOtpVerified" class="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle class="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                            <button type="button" @click="emailOtpDialogOpen = true"
                                :disabled="isLoading || emailOtpVerified"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 min-w-[100px]">
                                {{ emailOtpVerified ? "Verified" : emailOtpSent ? "OTP Sent" : "Send OTP" }}
                            </button>
                        </div>
                        <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
                    </div>

                    <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                            <Phone class="h-4 w-4" /> Phone Verification
                        </h3>
                        <label class="text-sm font-medium">Phone Number *</label>
                        <div class="flex gap-2 mt-1">
                            <div class="flex-1 relative flex">
                                <select v-model="countryCode"
                                    class="w-24 flex h-10 items-center justify-between rounded-md rounded-r-none border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                </select>
                                <input v-model="form1.phone" type="number"
                                    class="flex h-10 w-full rounded-md rounded-l-none border-l-0 border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Enter phone number" />
                                <div v-if="otpVerified" class="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle class="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                            <button type="button" @click="otpDialogOpen = true" :disabled="isLoading || otpVerified"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 min-w-[100px]">
                                {{ otpVerified ? "Verified" : otpSent ? "OTP Sent" : "Send OTP" }}
                            </button>
                        </div>
                        <p v-if="errors.phone" class="text-sm text-red-500 mt-1">{{ errors.phone }}</p>
                    </div>

                    <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                            <Key class="h-4 w-4" /> Create Your Password
                        </h3>
                        <div class="space-y-4">
                            <div class="space-y-2">
                                <label class="text-sm font-medium">Password *</label>
                                <div class="relative">
                                    <input v-model="form1.password" :type="showPassword ? 'text' : 'password'"
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-10"
                                        placeholder="Enter your password" />
                                    <button type="button" @click="showPassword = !showPassword"
                                        class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent">
                                        <EyeOff v-if="showPassword" class="h-4 w-4 text-slate-500" />
                                        <Eye v-else class="h-4 w-4 text-slate-500" />
                                    </button>
                                </div>
                                <p v-if="errors.password" class="text-sm text-red-500">{{ errors.password }}</p>

                                <div class="text-xs text-slate-500 space-y-1">
                                    <div>Password must contain:</div>
                                    <ul class="space-y-1 pl-4">
                                        <li class="flex items-center gap-2">
                                            <div class="w-1 h-1 rounded-full"
                                                :class="form1.password.length >= 8 ? 'bg-green-500' : 'bg-slate-400'">
                                            </div>
                                            At least 8 characters
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <div class="w-1 h-1 rounded-full"
                                                :class="/[A-Z]/.test(form1.password) ? 'bg-green-500' : 'bg-slate-400'">
                                            </div>
                                            One uppercase letter
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <div class="w-1 h-1 rounded-full"
                                                :class="/[0-9]/.test(form1.password) ? 'bg-green-500' : 'bg-slate-400'">
                                            </div>
                                            One number
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="text-sm font-medium">Confirm Password *</label>
                                <div class="relative">
                                    <input v-model="form1.confirmPassword"
                                        :type="showConfirmPassword ? 'text' : 'password'"
                                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-10"
                                        placeholder="Confirm your password" />
                                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                        class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent">
                                        <EyeOff v-if="showConfirmPassword" class="h-4 w-4 text-slate-500" />
                                        <Eye v-else class="h-4 w-4 text-slate-500" />
                                    </button>
                                </div>
                                <div v-if="form1.confirmPassword && form1.password"
                                    class="flex items-center gap-2 text-xs">
                                    <span v-if="form1.password === form1.confirmPassword"
                                        class="text-green-600 flex items-center gap-1">
                                        <CheckCircle class="h-3 w-3" /> Passwords match
                                    </span>
                                    <span v-else class="text-red-500 flex items-center gap-1">
                                        Passwords don't match
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else-if="currentStep === 2" class="space-y-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Business Type</label>
                        <select v-model="form2.businessType"
                            class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="" disabled>Select business type</option>
                            <option value="private_limited">Private Limited Company</option>
                            <option value="public_limited">Public Limited Company</option>
                            <option value="partnership">Partnership Firm</option>
                            <option value="llp">Limited Liability Partnership</option>
                            <option value="sole_proprietorship">Sole Proprietorship</option>
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-medium">GSTIN (if applicable)</label>
                        <div class="flex gap-2">
                            <div class="flex-1 relative">
                                <input v-model="form2.gstin" type="text" placeholder="07AAACH7409R1ZZ"
                                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                <div v-if="gstinVerified" class="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckCircle class="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                            <!-- <button type="button" @click="verifyGSTIN"
                                :disabled="gstinVerifying || gstinVerified || !form2.gstin"
                                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 min-w-[100px]">
                                <Loader2 v-if="gstinVerifying" class="h-4 w-4 animate-spin mr-2" />
                                {{ gstinVerifying ? "Verifying..." : gstinVerified ? "Verified" : "Verify GSTIN" }}
                            </button> -->
                        </div>
                        <p v-if="errors.gstin" class="text-sm text-red-500">{{ errors.gstin }}</p>
                    </div>
                </div>

                <div v-else-if="currentStep === 3" class="space-y-6">
                    <h2 class="text-2xl font-bold text-center">Document Verification</h2>
                    <p class="text-slate-500 text-center">Verify your documents for KYC compliance</p>

                    <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                            <FileText class="h-4 w-4" /> PAN Card Details *
                        </h3>
                        <div
                            class="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white/50">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText class="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p class="font-medium text-sm">PAN Card</p>
                                    <p class="text-xs text-slate-500">Required for business verification</p>
                                </div>
                            </div>
                            <button @click="panDialogOpen = true"
                                :class="panVerified ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-900'"
                                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 gap-2">
                                <CheckCircle v-if="panVerified" class="h-4 w-4" />
                                <Shield v-else class="h-4 w-4" />
                                {{ panVerified ? "Verified" : "Verify" }}
                            </button>
                        </div>
                    </div>

                    <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                            <FileText class="h-4 w-4" /> Aadhaar Card Details *
                        </h3>
                        <div
                            class="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white/50">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FileText class="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p class="font-medium text-sm">Aadhaar Card</p>
                                    <p class="text-xs text-slate-500">Required for identity verification</p>
                                </div>
                            </div>
                            <button @click="aadhaarDialogOpen = true"
                                :class="aadhaarVerified ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-900'"
                                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 gap-2">
                                <CheckCircle v-if="aadhaarVerified" class="h-4 w-4" />
                                <Shield v-else class="h-4 w-4" />
                                {{ aadhaarVerified ? "Verified" : "Verify" }}
                            </button>
                        </div>
                    </div>

                    <div class="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <h3 class="text-sm font-medium mb-3 flex items-center gap-2">
                            <FileText class="h-4 w-4" /> Bank Details *
                        </h3>
                        <div
                            class="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white/50">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText class="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p class="font-medium text-sm">Bank Account Details</p>
                                    <p class="text-xs text-slate-500">Required for payment processing</p>
                                </div>
                            </div>
                            <button @click="bankDialogOpen = true"
                                :class="bankVerified ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-900'"
                                class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 gap-2">
                                <CheckCircle v-if="bankVerified" class="h-4 w-4" />
                                <Shield v-else class="h-4 w-4" />
                                {{ bankVerified ? "Verified" : "Verify" }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else-if="currentStep === 4" class="space-y-6">
                    <h3 class="text-lg font-semibold">Business Information</h3>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Website URL (Optional)</label>
                        <input v-model="form4.website" placeholder="https://www.yourwebsite.com"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Services/Products Offered</label>
                        <input v-model="form4.services" placeholder="Describe your main services or products"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium">Use Case for KYC API</label>
                        <input v-model="form4.useCase" placeholder="How will you use our KYC services?"
                            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                </div>

                <div v-else-if="currentStep === 5" class="space-y-6 text-center">
                    <div class="animate-pulse">
                        <Shield class="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    </div>
                    <h3 class="text-lg font-semibold">Document Verification in Progress</h3>
                    <p class="text-slate-500">
                        We are verifying your uploaded documents. This process may take a few moments.
                    </p>
                    <div class="space-y-2">
                        <div class="flex items-center justify-center gap-2">
                            <Loader2 class="h-4 w-4 animate-spin" />
                            <span class="text-sm">Verifying PAN Card...</span>
                        </div>
                        <div class="flex items-center justify-center gap-2">
                            <Loader2 class="h-4 w-4 animate-spin" />
                            <span class="text-sm">Verifying Aadhaar Card...</span>
                        </div>
                        <div class="flex items-center justify-center gap-2">
                            <Loader2 class="h-4 w-4 animate-spin" />
                            <span class="text-sm">Verifying Bank Details...</span>
                        </div>
                    </div>
                </div>

                <div v-else-if="currentStep === 6" class="space-y-6">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-bold mb-2">Review & Submit Application</h2>
                        <p class="text-slate-500">Please review your information before submitting</p>
                    </div>

                    <div class="bg-white/50 p-6 rounded-lg border border-slate-200">
                        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User class="h-5 w-5" /> Personal Information
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex justify-between"><span class="text-slate-500">Merchant Name:</span> <span
                                    class="font-medium">{{ userdetail.user.name }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Email:</span> <span
                                    class="font-medium">{{ userdetail.user.email }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Phone:</span> <span
                                    class="font-medium"> {{ userdetail.user.phone_number }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Verification Status:</span>
                                <span class="font-medium text-green-600 flex items-center gap-1">
                                    <CheckCircle class="h-4 w-4" /> Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white/50 p-6 rounded-lg border border-slate-200">
                        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building class="h-5 w-5" /> Business Details
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="flex justify-between"><span class="text-slate-500">Type:</span> <span
                                    class="font-medium">{{ userdetail.business_type || 'Not specified' }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">GSTIN:</span> <span
                                    class="font-medium">{{ userdetail.gstin || 'Not provided' }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Website:</span> <span
                                    class="font-medium">{{ userdetail.website_url || 'Not provided' }}</span></div>
                            <div class="flex justify-between"><span class="text-slate-500">Services:</span> <span
                                    class="font-medium">{{ userdetail.services_products_offered || 'Not specified'
                                    }}</span></div>
                        </div>
                    </div>

                    <div class="bg-white/50 p-6 rounded-lg border border-slate-200">
                        <div class="flex flex-row items-start space-x-3">
                            <input type="checkbox" v-model="form4.termsAccepted" id="terms"
                                class="h-4 w-4 mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500">
                            <div class="space-y-1 leading-none">
                                <label for="terms" class="text-sm font-medium cursor-pointer">
                                    I agree to the <a href="#" class="text-blue-600 underline">Terms of Service</a> and
                                    <a href="#" class="text-blue-600 underline">Privacy Policy</a>
                                </label>
                                <p class="text-xs text-slate-500">By submitting, you confirm information is accurate.
                                </p>
                                <p v-if="errors.termsAccepted" class="text-sm text-red-500">{{ errors.termsAccepted }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between">
                <button @click="prevStep" :disabled="currentStep === 1"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 disabled:opacity-50 gap-2">
                    <ChevronLeft class="h-4 w-4" /> Previous
                </button>

                <button @click="nextStep"
                    :disabled="isVerifying || isSubmitting || (currentStep === 6 && !form4.termsAccepted)"
                    :class="currentStep === 6 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 disabled:opacity-50 gap-2 min-w-[120px]">
                    <span v-if="isVerifying || isSubmitting" class="flex items-center gap-2">
                        <Loader2 class="h-4 w-4 animate-spin" />
                        {{ isSubmitting ? 'Submitting...' : 'Verifying...' }}
                    </span>
                    <span v-else-if="currentStep === 6" class="flex items-center gap-2">
                        Submit Application
                        <CheckCircle class="h-4 w-4" />
                    </span>
                    <span v-else-if="currentStep === 5" class="flex items-center gap-2">
                        Continue to Review
                    </span>
                    <span v-else class="flex items-center gap-2">
                        Continue
                        <ChevronRight class="h-4 w-4" />
                    </span>
                </button>
            </div>
        </div>

        <div v-if="otpDialogOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <h3 class="text-lg font-semibold">OTP Verification</h3>
                <p class="text-sm text-slate-500">
                    {{ !otpSent
                        ? "We'll send a code to your phone."
                        : "Enter the 6-digit OTP sent to your phone."
                    }}
                </p>

                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-slate-500">Phone:</span>
                        <span class="font-medium">{{ countryCode }} {{ form1.phone }}</span>
                    </div>
                    <div v-if="otpSent">
                        <label class="text-sm font-medium">Enter OTP</label>
                        <input v-model="form1.otp" maxlength="6"
                            class="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm mt-1"
                            placeholder="6-digit OTP" />
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="otpDialogOpen = false"
                            class="px-4 py-2 text-sm border rounded hover:bg-slate-100">
                            Cancel
                        </button>

                        <!-- Send OTP -->
                        <button v-if="!otpSent" @click="sendOTP"
                            class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-slate-800 disabled:opacity-50"
                            :disabled="isLoading">
                            {{ isLoading ? "Sending..." : "Send OTP" }}
                        </button>

                        <!-- Verify + Resend -->
                        <template v-else> 
                            <button @click="verifyPhoneOTP" :disabled="!form1.otp || isLoading"
                                class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-slate-800 disabled:opacity-50"
                                >
                                  {{ isLoading ? "Verify OTP..." : "Verify OTP" }}
                            </button>

                            <button @click="resendOTP"   :disabled="isLoading1"
                                class="px-4 py-2 text-sm border rounded hover:bg-slate-100 disabled:opacity-50">
                               
                                    {{ isLoading1 ? "Sending..." : "Resend OTP" }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="emailOtpDialogOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <h3 class="text-lg font-semibold">Email OTP Verification</h3>
                <p class="text-sm text-slate-500">
                    {{ !emailOtpSent
                        ? "We'll send a code to your email."
                        : "Enter the 6-digit OTP sent to your email."
                    }}
                </p>
                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-slate-500">Email:</span>
                        <span class="font-medium">{{ form1.email }}</span>
                    </div>
                    <div v-if="emailOtpSent">
                        <label class="text-sm font-medium">Enter OTP</label>
                        <input v-model="form1.emailOtp" maxlength="6"
                            class="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm mt-1"
                            placeholder="6-digit OTP" />
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="emailOtpDialogOpen = false"
                            class="px-4 py-2 text-sm border rounded hover:bg-slate-100">
                            Cancel
                        </button>

                        <!-- Send OTP -->
                        <button v-if="!emailOtpSent" @click="sendEmailOTP"
                            class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-slate-800 disabled:opacity-50"
                            :disabled="isLoading">
                            {{ isLoading ? "Sending..." : "Send OTP" }}
                        </button>

                        <!-- Verify + Resend -->
                        <template v-else>
                            <button @click="verifyEmailOTP"
                                class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-slate-800 disabled:opacity-50"
                                :disabled="!form1.emailOtp || isLoading">
                                {{ isLoading ? "Sending..." : "Verify OTP" }}
                            </button>

                            <button @click="resendEmailOTP" class="px-4 py-2 text-sm border rounded hover:bg-slate-100"
                                :disabled="isLoading1">
                                {{ isLoading1 ? "Sending..." : "Resend OTP" }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="panDialogOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <h3 class="text-lg font-semibold">PAN Verification</h3>

                <div class="space-y-4">



                    <Input type="file" v-if="!panPreview" accept="image/png,image/jpeg,image/jpg" ref="panInputRef"
                        @change="handlePanFile" />

                    <!-- Image Preview with Remove Icon -->
                    <div v-if="panPreview" class="relative border rounded-lg p-2">
                        <button @click="removePanFile" type="button" class="absolute top-1 right-1 bg-black/70 text-white
               rounded-full w-6 h-6 flex items-center justify-center
               hover:bg-black">
                            ✕
                        </button>

                        <img :src="panPreviewUrl" alt="PAN Preview" class="w-full h-40 object-contain rounded" />
                    </div>


                    <!-- Buttons -->
                    <div class="flex justify-end gap-2">
                        <button @click="panDialogOpen = false"
                            class="px-4 py-2 text-sm border rounded hover:bg-slate-100">
                            Cancel
                        </button>

                        <button @click="verifyPan" :disabled="!panFile || isLoading" class="px-4 py-2 text-sm bg-black text-white rounded
                 hover:bg-slate-800 disabled:opacity-50">
                            <span v-if="isLoading"
                                class="loader-border loader-border-white animate-spin w-4 h-4 rounded-full"></span>
                            <span>{{ isLoading ? 'Verifying...' : 'Verify' }}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>



        <div v-if="aadhaarDialogOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-5">
                <h3 class="text-lg font-semibold">Aadhaar Verification</h3>

                <!-- Aadhaar Front -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                        Aadhaar Front
                    </label>

                    <Input type="file" accept="image/png,image/jpeg,image/jpg" class="w-full"
                        @change="onAadhaarFrontChange" />

                    <div v-if="aadhaarFrontPreview" class="relative border rounded-lg p-2">
                        <button type="button" @click="removeAadhaarFront" class="absolute top-1 right-1 bg-black/70 text-white rounded-full
                           w-6 h-6 flex items-center justify-center hover:bg-black">
                            ✕
                        </button>

                        <img :src="aadhaarfrontUrl" class="w-full h-40 object-contain rounded" alt="Aadhaar Front" />
                    </div>
                </div>

                <!-- Aadhaar Back -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">
                        Aadhaar Back
                    </label>

                    <Input type="file" accept="image/png,image/jpeg,image/jpg" class="w-full"
                        @change="onAadhaarBackChange" />

                    <div v-if="aadhaarBackPreview" class="relative border rounded-lg p-2">
                        <button type="button" @click="removeAadhaarBack" class="absolute top-1 right-1 bg-black/70 text-white rounded-full
                           w-6 h-6 flex items-center justify-center hover:bg-black">
                            ✕
                        </button>

                        <img :src="aadhaarbackUrl" class="w-full h-40 object-contain rounded" alt="Aadhaar Back" />
                    </div>
                </div>

                <!-- Buttons -->
                <div class="flex justify-end gap-2 pt-3">
                    <button @click="aadhaarDialogOpen = false"
                        class="px-4 py-2 text-sm border rounded hover:bg-slate-100">
                        Cancel
                    </button>

                    <button @click="verifyAadhaar" :disabled="!aadhaarBack || !aadhaarFront || isLoading" class="px-4 py-2 text-sm bg-black text-white rounded
                 hover:bg-slate-800 disabled:opacity-50">
                        <span v-if="isLoading"
                            class="loader-border loader-border-white animate-spin w-4 h-4 rounded-full"></span>
                        <span>{{ isLoading ? 'Verifying...' : 'Verify' }}</span>
                    </button>


                </div>
            </div>
        </div>


        <div v-if="bankDialogOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                <h3 class="text-lg font-semibold">Bank Verification</h3>
                <div class="space-y-4">
                    <div>
                        <label class="text-sm font-medium">Account Number</label>
                        <input v-model="form3.accountNumber" type="text"
                            class="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm mt-1"
                            placeholder="Enter Account Number" />
                    </div>
                    <div>
                        <label class="text-sm font-medium">IFSC Code</label>
                        <input v-model="form3.ifscCode"
                            class="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm mt-1 uppercase"
                            placeholder="ABCD0123456" />
                    </div>
                    <div>
                        <label class="text-sm font-medium">Holder Name</label>
                        <input v-model="form3.accountHolderName"
                            class="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm mt-1"
                            placeholder="Name as per bank" />
                    </div>
                    <div class="flex justify-end gap-2">
                        <button @click="bankDialogOpen = false"
                            class="px-4 py-2 text-sm border rounded hover:bg-slate-100">Cancel</button>
                        <button @click="verifyBank"
                            :disabled="!form3.accountHolderName || !form3.ifscCode || !form3.accountNumber || isLoading"
                            class="px-4 py-2 text-sm bg-black text-white rounded
                 hover:bg-slate-800 disabled:opacity-50">
                            <span v-if="isLoading"
                                class="loader-border loader-border-white animate-spin w-4 h-4 rounded-full"></span>
                            <span>{{ isLoading ? 'Verifying...' : 'Verify' }}</span></button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Add any specific component styles here if tailwind is not enough */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.loader-border {
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
}
</style>