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

import { Eye, FileText, ExternalLink, Loader2 } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";

const rc_no = ref("");
const fastag = ref("");
const allRecords = ref([]);

const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<any>(null);
const isVerifying = ref(false);

async function handleVerify() {
    isVerifying.value = true;
    if (!rc_no.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter RC Number",
            variant: "destructive"
        });
        return;
    }
    if (!fastag.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter fastag Number",
            variant: "destructive"
        });
        return;
    }
    try {
        const response = await axios.post("/rc-fastag", {

            rc_no: rc_no.value,
            fastag: fastag.value,

        });

        console.log(response);


        getrecords();
        toast({
            title: "Success",
            description: response.data.message,
        });
        isDialogOpen.value = false;
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

async function getrecords() {
    try {

        const response = await axios.post("/rc-fastag-records");
        allRecords.value = response.data.data;
        console.log(allRecords.value);




    } catch (err) {

    }
}

onMounted(() => {
    getrecords();
});

function formatDate(isoString: string) {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-based
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

const { toast } = useToast();

async function handleViewRecord(id) {
    console.log(id);
    try {

        const response = await axios.post("/rc-fastag-recordID", { id: id });

        if (response.data.status === true) {
            selectedRecord.value = response.data.data;
            isViewDialogOpen.value = true;

        }

    } catch (err) {

    }
    // selectedRecord.value = record;
    // isViewDialogOpen.value = true;
}


</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div>
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Fastag Verification</h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-sm sm:text-base text-muted-foreground">
                        Verify Fastag.
                    </p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLink class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                Verify fastag
            </Button>
        </div>


        <!-- Tabs -->
        <Tabs default-value="records">

            <TabsContent value="records" class="space-y-4">

                <Card>
                    <CardContent class="p-0">
                        <template v-if="allRecords.length > 0">
                            <Table>
                                <TableHeader>
                                    <TableRow class="border-b">
                                        <TableHead>Verified At</TableHead>
                                        <TableHead>Verification ID</TableHead>
                                        <TableHead>Fastag</TableHead>
                                        <TableHead>RC Number</TableHead>

                                        <TableHead>Status</TableHead>

                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="record in allRecords" :key="record.id" class="hover:bg-muted/50">
                                        <TableCell class="font-mono text-sm">{{ formatDate(record.created_at) }}
                                        </TableCell>
                                        <TableCell class="font-mono text-sm text-blue-600">{{ record.verification_id }}
                                        </TableCell>
                                        <TableCell class="font-mono">{{ record.fastag }}</TableCell>
                                        <TableCell class="font-mono">{{ record.rc_no }}</TableCell>
                                        <TableCell>{{ record.status }}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" @click="handleViewRecord(record.id)"
                                                class="text-blue-600 hover:text-blue-800">
                                                <Eye class="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </template>
                        <template v-else>
                            <div class="flex flex-col items-center justify-center py-16">
                                <div class="relative mb-4">
                                    <FileText class="h-16 w-16 text-muted-foreground/30" />
                                    <FileText class="h-12 w-12 text-muted-foreground/50 absolute top-2 left-2" />
                                </div>
                                <h3 class="text-lg font-semibold mb-2">No data found!</h3>
                                <p class="text-muted-foreground">Please check the selected filters</p>
                            </div>
                        </template>
                    </CardContent>
                </Card>
            </TabsContent>

            <!-- Batch Tab -->
            <TabsContent value="batch">
                <Card>
                    <CardContent class="flex flex-col items-center justify-center py-16">
                        <FileText class="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 class="text-lg font-semibold mb-2">Batch verification coming soon</h3>
                        <p class="text-muted-foreground">Upload CSV files for bulk verification</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <!-- Verify Dialog -->
        <Dialog :open="isDialogOpen" @update:open="val => isDialogOpen = val">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verify Fastag Number</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <!-- Account Holder -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="rc">RC Number</Label>

                        </div>
                        <Input id="rc" placeholder="RC Number" v-model="rc_no" />
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="Fastag">Fastag Name</Label>

                        </div>
                        <Input id="Fastag" placeholder="Fastag Name" v-model="fastag" />
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button @click="handleVerify" :disabled="!rc_no && !fastag"
                            class="bg-purple-600 hover:bg-purple-700">
                            <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
                            <template v-if="!isVerifying">Verify</template>
                            <template v-else>Verifying...</template>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Dialog v-model:open="isViewDialogOpen">
            <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">

                <DialogHeader>
                    <DialogTitle>Verification Details</DialogTitle>
                </DialogHeader>

                <div v-if="selectedRecord" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verified At</span>
                            <span class="font-mono">{{ formatDate(selectedRecord.created_at) }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verification ID</span>
                            <span class="font-mono">{{ selectedRecord.verification_id }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">RC Number</span>
                            <span class="font-mono">{{ selectedRecord.rc_no }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Fastag Name</span>
                            <span class="font-mono">{{ selectedRecord.fastag }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Owner Name</span>
                            <span class="font-mono">{{ selectedRecord.owner_name }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Min Recharge Amount</span>
                            <span class="font-mono">{{ selectedRecord.min_recharge_amount }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Max Recharge Amount</span>
                            <span class="font-mono">{{ selectedRecord.max_recharge_amount }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Biller ID</span>
                            <span class="font-mono">{{ selectedRecord.biller_id }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Biller Name</span>
                            <span class="font-mono">{{ selectedRecord.biller_name }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Balance</span>
                            <span class="font-mono">{{ selectedRecord.balance }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Status</span>
                            <span class="font-mono">{{ selectedRecord.status }}</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Message</span>
                            <span class="font-mono">{{ selectedRecord.message }}</span>
                        </div>


                    </div>

                    <div class="flex justify-end pt-4">
                        <Button variant="outline" @click="isViewDialogOpen = false">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    </div>
</template>
