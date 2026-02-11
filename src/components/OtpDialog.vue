<script setup lang="ts">
import { ref, watch } from "vue";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "vue-sonner";
import { PinInput, PinInputGroup, PinInputSlot } from "@/components/ui/pin-input";

// Props
const props = defineProps<{
    open: boolean;
    generatedOtp?: string;
}>();

// Emits
const emit = defineEmits(["update:open", "verified", "cancel"]);

// Local state
const otpValue = ref<string[]>([]);
const errorMessage = ref<string>("");
const isLoading = ref<boolean>(false);
const countdown = ref<number>(0);

// Reset when dialog closes
watch(
    () => props.open,
    (val) => {
        if (!val) {
            otpValue.value = [];
            errorMessage.value = "";
            isLoading.value = false;
        } else {
            startCountdown();
        }
    }
);

// Countdown timer for resend OTP
const startCountdown = () => {
    countdown.value = 30;
    const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
        }
    }, 1000);
};

// Validate OTP format
const validateOtp = (otp: string): string | null => {
    if (otp.length !== 6) return "Please enter all 6 digits.";
    if (!/^\d{6}$/.test(otp)) return "OTP must contain only numbers.";
    return null;
};

// Verify OTP
const handleVerifyOtp = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const enteredOtp = otpValue.value.join("");
    const validationError = validateOtp(enteredOtp);

    if (validationError) {
        errorMessage.value = validationError;
        toast.error(validationError);
        isLoading.value = false;
        return;
    }

    const validOtp = props.generatedOtp || "123456";

    if (enteredOtp === validOtp) {
        toast.success("OTP verified successfully!");
        errorMessage.value = "";
        emit("verified");
        emit("update:open", false);
    } else {
        errorMessage.value = "Invalid OTP. Please try again.";
        toast.error(errorMessage.value);
        otpValue.value = [];
    }

    isLoading.value = false;
};

// Handle resend OTP
const handleResendOtp = () => {
    if (countdown.value > 0) return;

    toast.success("New OTP sent to your number");
    startCountdown();
    otpValue.value = [];
    errorMessage.value = "";
};
</script>

<template>
    <Dialog :open="props.open" @update:open="emit('update:open', $event)">
        <DialogContent class="sm:max-w-md">
            <DialogHeader class="text-center space-y-4">
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div class="space-y-2">
                    <DialogTitle class="text-xl font-semibold tracking-tight">
                        Verify Your Identity
                    </DialogTitle>
                    <DialogDescription class="text-base leading-relaxed">
                        Enter the 6-digit verification code sent to your registered mobile number.
                    </DialogDescription>
                </div>
            </DialogHeader>

            <!-- OTP Input Section -->
            <div class="space-y-6 py-4">
                <div class="flex justify-center">
                    <PinInput id="otp-input" v-model="otpValue" placeholder="-" :disabled="isLoading"
                        @complete="handleVerifyOtp">
                        <PinInputGroup class="gap-3">
                            <PinInputSlot v-for="(_, index) in 6" :key="index" :index="index"
                                class="w-12 h-12 text-center text-lg font-semibold border rounded-lg transition-all duration-200 focus:ring-1 focus:ring-primary focus:border-primary"
                                :class="[
                                    errorMessage ? 'border-destructive ring-destructive/20' : 'border-input',
                                    'bg-background hover:border-primary/50'
                                ]" />
                        </PinInputGroup>
                    </PinInput>
                </div>

                <!-- Status Messages -->
                <div class="space-y-3 text-center">
                    <div v-if="errorMessage"
                        class="text-sm text-destructive font-medium bg-destructive/10 py-2 px-3 rounded-md">
                        {{ errorMessage }}
                    </div>

                    <div class="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <span>Didn't receive the code?</span>
                        <Button variant="link" class="h-auto p-0 text-primary font-medium" :disabled="countdown > 0"
                            @click="handleResendOtp">
                            Resend OTP
                            <span v-if="countdown > 0" class="text-muted-foreground ml-1">
                                ({{ countdown }}s)
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Demo Hint -->
            <Card class="bg-muted/30 border-muted">
                <CardContent class="p-3">
                    <p class="text-xs text-center text-muted-foreground">
                        <span class="font-medium">Demo:</span> Use
                        <code class="bg-muted px-2 py-1 rounded-md text-xs font-mono">123456</code>
                        for testing purposes
                    </p>
                </CardContent>
            </Card>

            <!-- Action Buttons -->
            <DialogFooter class="mt-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button variant="outline" @click="emit('cancel')" :disabled="isLoading" class="flex-1 sm:flex-none">
                    Cancel
                </Button>
                <Button @click="handleVerifyOtp" :disabled="isLoading || otpValue.length !== 6"
                    class="flex-1 sm:flex-none">
                    <span v-if="isLoading" class="flex items-center gap-2">
                        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
             5.291A7.962 7.962 0 014 12H0c0 
             3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                    </span>
                    <span v-else>Verify</span>
                </Button>
            </DialogFooter>

        </DialogContent>
    </Dialog>
</template>