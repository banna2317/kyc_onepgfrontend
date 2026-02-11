<script setup lang="ts">
import { h, ref, computed, onMounted } from "vue";

import { TabsTrigger } from "@/components/ui/tabs";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";

import { TableHead } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CardContent from "@/components/ui/card/CardContent.vue";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui/tabs";
import axios from "@/axios";

import { Eye, FileText, ExternalLink, Loader2Icon, ExternalLinkIcon } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";

const ifscCode = ref("");
const result = ref(null);
const isVerifying = ref(false);

async function handleVerify() {

    if (!ifscCode.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter IFSC code",
            variant: "destructive"
        });
        return;
    }
    isVerifying.value = true;

    try {
        const response = await axios.post("/bank-ifsc-verification", {

            ifsc_code: ifscCode.value,

        });

        console.log('lok', response.data.status);

        if (response.data.status === true) {
            result.value = response.data.data;
            isVerifying.value = false;
        }


        toast({
            title: "Success",
            description: response.data.message,
        });

    } catch (err) {
        if (err.response && err.response.status === 422) {
            const errors = err.response.data.errors;
            Object.values(errors).forEach((msgArray) => {
                toast({
                    title: "Validation Error",
                    description: msgArray[0],
                    variant: "destructive",
                });
            });
            return;
        }
        if (err.response && err.response.status === 401) {
            toast({
                title: "Unauthorized",
                description: err.response.data.message || "Please login first.",
                variant: "destructive",
            });
            return;
        }
        toast({
            title: "Error",
            description: err.response?.data?.message || "Something went wrong.",
            variant: "destructive",
        });
    } finally {
        isVerifying.value = false;
    }
}




const { toast } = useToast();




</script>

<template>
    <div class="max-w-2xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">IFSC</h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-muted-foreground">Verify IFSC</p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLinkIcon class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button variant="outline" class="text-red-600 border-red-200 hover:bg-red-50 w-full md:w-auto">
                <ExternalLinkIcon class="h-4 mr-2 w-4" />
                How to verify an IFSC?
            </Button>
        </div>


        <!-- IFSC Input Form -->
        <Card class="border-border/50">
            <CardContent class="p-6 space-y-4">
                <div class="space-y-2">
                    <Label for="ifsc">Enter IFSC</Label>
                    <Input id="ifsc" placeholder="Enter IFSC Code" v-model="ifscCode" @keypress.enter="handleVerify"
                        maxlength="11" class="text-lg" />
                </div>
                <Button :disabled="!ifscCode || ifscCode.length !== 11 || isVerifying"
                    class="bg-purple-600 hover:bg-purple-700 px-8" @click="handleVerify">
                    <template v-if="isVerifying">
                        <Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                    </template>
                    <template v-else>Verify</template>
                </Button>
            </CardContent>
        </Card>

        <!-- Verification Result -->
        <Card v-if="result" class="border-border/50">
            <CardContent class="p-6 space-y-6">
                <!-- Status Header -->
                <div class="flex items-center gap-3">
                    <CheckCircleIcon v-if="result.status == 'success'" class="h-8 w-8 text-green-600" />
                    <XCircleIcon v-else class="h-8 w-8 text-red-600" />
                    <span class="text-xl font-semibold">
                        {{ result.status == 'success' ? "Valid IFSC" : "Invalid IFSC" }}
                    </span>
                </div>

                <!-- Bank Details -->
                <div v-if="result.status == 'success'" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex justify-between items-start py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Bank Name</span>
                            <span class="font-semibold text-right">{{ result.branch_name }}</span>
                        </div>


                        <div class="flex justify-between items-start py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Address</span>
                            <span class="font-semibold text-right max-w-md">{{ result.branch_address }}</span>
                        </div>



                        <div class="flex justify-between items-start py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">IFSC Code</span>
                            <span class="font-semibold text-right font-mono">{{ result.ifsc_code }}</span>
                        </div>


                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
