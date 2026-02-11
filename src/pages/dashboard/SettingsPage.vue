<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    Building2, Users, Palette, Shield, Download,
    Upload, UserPlus, Trash2, Edit, Crown, User
} from "lucide-vue-next";
import InviteMemberDialog from "@/components/settings/InviteMemberDialog.vue";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const { toast } = useToast();
const roles = ["Owner", "Admin", "Developer", "Reviewer"];
const permissions = [
    "View Verifications",
    "Manage Cases",
    "Configure Rules",
    "Manage API Keys",
    "Access Billing",
    "Manage Team"
];
import axios from '@/axios'
// Default permission states per role
const rolePermissions = reactive<Record<string, Record<string, boolean>>>({
    Owner: {},
    Admin: {},
    Developer: {},
    Reviewer: {}
});

// Initialize default permissions
roles.forEach(role => {
    permissions.forEach(permission => {
        if (role === "Owner") rolePermissions[role][permission] = true;
        else if (role === "Admin") rolePermissions[role][permission] = permission !== "Manage Team";
        else if (role === "Developer") rolePermissions[role][permission] = ["View Verifications", "Manage API Keys"].includes(permission);
        else if (role === "Reviewer") rolePermissions[role][permission] = ["View Verifications", "Manage Cases"].includes(permission);
        else rolePermissions[role][permission] = false;
    });
});

// Role icons helper

// Organization & Address
const organization = reactive({
    name: "Acme Finserve Pvt Ltd",
    legal_name_of_business: "",
    industry: "Financial Services",
    registration: "U65923MH2020PTC123456",
    website: "https://acmefinserv.com",
    supportEmail: "support@acmefinserv.com",
});

const address = ref({
    line1: "123 Business District",
    line2: "Lower Parel",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400013",
    country: "India",
    phone: "+91 22 1234 5678",
});

// Members
const members = ref([
    { id: "1", name: "John Doe", email: "john@acmefinserv.com", role: "Owner", status: "active", lastActive: "2 hours ago" },
    { id: "2", name: "Sarah Wilson", email: "sarah@acmefinserv.com", role: "Admin", status: "active", lastActive: "1 day ago" },
    { id: "3", name: "Mike Chen", email: "mike@acmefinserv.com", role: "Developer", status: "active", lastActive: "3 hours ago" },
    { id: "4", name: "Lisa Kumar", email: "lisa@acmefinserv.com", role: "Reviewer", status: "pending", lastActive: "Never" }
]);
const loading = ref(true)
const inviting = ref(false);
const userdetail = ref([]);

// Branding
const branding = reactive({
    logo: null as File | null,
    brandName: "Acme Finserve",
    primaryColor: "#5B6CFF",
    customDomain: "verify.acmefinserv.com",
    welcomeMessage: "Welcome to Acme Finserve! Let's verify your identity to get started.",
    privacyUrl: "https://acmefinserv.com/privacy",
    termsUrl: "https://acmefinserv.com/terms",
    showPoweredBy: true,
    darkMode: false,
    multiLanguage: true
});

// Compliance
const compliance = reactive({
    retentionPeriod: "7 years (recommended)",
    autoDeletion: "After retention period",
    consentNotice: "By proceeding, you consent to the collection and processing of your personal data for identity verification purposes as per our Privacy Policy. You have the right to withdraw consent, access, correct, or delete your data at any time.",
    explicitConsent: true,
    dataExport: true,
    rightToBeForgotten: true
});

// Handlers
const handleInviteMember = async (email: string, role: string) => {
    inviting.value = true;
    try {
        toast({ title: "Invitation Sent", description: `Invitation sent to ${email} with ${role} role` });
    } finally {
        inviting.value = false;
    }
};

const handleUpdateOrganization = () => toast({ title: "Organization Updated", description: "Organization details updated" });
const handleUpdateAddress = () => toast({ title: "Address Updated", description: "Business address updated" });
const handleEditMember = (member: any) => toast({ title: "Edit Member", description: `Edit ${member.name}` });
const handleDeleteMember = (member: any) => toast({ title: "Member Deleted", description: `${member.name} removed`, variant: "destructive" });
const handleUploadLogo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpg, image/jpeg';
    input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            branding.logo = file;
            toast({ title: "Logo Uploaded", description: `Uploaded ${file.name}` });
        }
    };
    input.click();
};
const handlePreviewWidget = () => { toast({ title: "Preview Widget" }); window.open('/widget-preview', '_blank'); };
const handleDownloadAuditTrail = () => toast({ title: "Download Started", description: "Audit trail downloading" });
const handleDownloadDataReport = () => toast({ title: "Download Started", description: "Data report downloading" });
const handleDownloadComplianceCertificate = () => toast({ title: "Download Started", description: "Compliance certificate downloading" });



const getRoleIcon = (role: string) => {
    switch (role) {
        case "Owner":
            return { component: Crown, class: "h-4 w-4 text-warning" };

        case "Admin":
            return { component: Shield, class: "h-4 w-4 text-primary" };

        default:
            return { component: User, class: "h-4 w-4 text-muted-foreground" };
    }
};


const getRoleBadge = (role: string) => {
    switch (role) {
        case "Owner": return { component: Badge, props: { class: "bg-warning/10 text-primary-foreground hover:bg-primary/80 text-warning border-warning/20 rounded-full border px-2.5 py-0.5" }, text: "Owner" };
        case "Admin": return { component: Badge, props: { class: "bg-primary/10 hover:bg-primary/80 rounded-full border px-2.5 py-0.5 text-primary border-primary/20" }, text: "Admin" };
        case "Developer": return { component: Badge, props: { variant: "outline", class: "rounded-full border px-2.5 py-0.5" }, text: "Developer" };
        case "Reviewer": return { component: Badge, props: { variant: "secondary", class: "rounded-full border px-2.5 py-0.5" }, text: "Reviewer" };
        default: return { component: Badge, props: { variant: "outline" }, text: role };
    }
};
const getStatusBadge = (status: string) => {
    switch (status) {
        case "active": return { component: Badge, props: { class: "bg-success/10 hover:bg-primary/80 text-success border-success/20 rounded-full border px-2.5 py-0.5" }, text: "Active" };
        case "pending": return { component: Badge, props: { class: "bg-warning/10 text-warning border-warning/20 hover:bg-primary/80 text-success border-success/20 rounded-full border px-2.5 py-0.5 " }, text: "Pending" };
        case "inactive": return { component: Badge, props: { variant: "outline" }, text: "Inactive" };
        default: return { component: Badge, props: { variant: "secondary" }, text: status };
    }
};

// 
// 


const getdata = async () => {
    loading.value = true
    try {
        const response = await axios.post('/user-detail');
        console.log(response.data.data);
        userdetail.value = response.data.data;

          const addr = response.data.data.additional_address_array?.[0]
        || response.data.data.principal_place_split_address

    if (addr) {
      address.value = {
        address_line_1: addr.address ?? '',
        address_line_2: '',
        city: addr.split_address?.city ?? '',
        state: addr.split_address?.state ?? '',
        pincode: addr.split_address?.pincode ?? '',
        country: 'India',
        phone: ''
      }
    }

    } catch {

    } finally {
        loading.value = false
    }
}



onMounted(getdata)


</script>

<template>
    <div class="space-y-3">
        <!-- Header -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
                <p class="text-muted-foreground">Manage organization and team settings</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button>
                        <Download class="mr-2 h-4 w-4" /> Download Audit Bundle
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Download Audit Bundle</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will download a comprehensive audit bundle. Continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction @click="handleDownloadAuditTrail">Download</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <Tabs defaultValue="organization" class="space-y-1">
            <TabsList>
                <TabsTrigger value="organization">Organization</TabsTrigger>
                <TabsTrigger value="members">Team Members</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <!-- Organization Tab -->
            <TabsContent value="organization">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <!-- Organization Card -->
                    <Card class="glass-card">
                        <CardHeader>
                            <CardTitle class="flex items-center space-x-2">
                                <Building2 class="h-10 w-5 mr-2" /> Organization Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-2">
                            <div>
                                <label class="text-sm font-medium">Organization Name</label>
                                <Input v-model="userdetail.legal_name_of_business" readonly class="mt-1" />
                            </div>
                            <div>
                                <label class="text-sm font-medium">Industry</label>
                                <select v-model="userdetail.business_type" readonly
                                    class="mt-1 w-full p-2 border border-border rounded-lg bg-background">
                                    <option value="private_limited">Private Limited Company</option>
                                    <option value="public_limited">Public Limited Company</option>
                                    <option value="partnership">Partnership Firm</option>
                                    <option value="llp">Limited Liability Partnership</option>
                                    <option value="sole_proprietorship">Sole Proprietorship</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-sm font-medium">Business Registration</label>
                                <Input v-model="userdetail.gstin" readonly class="mt-1" />
                            </div>
                            <div>
                                <label class="text-sm font-medium">Website</label>
                                <Input v-model="userdetail.website_url" readonly class="mt-1" />
                            </div>
                            <div v-if="userdetail?.user">
                                <label class="text-sm font-medium">Support Email</label>
                                <Input v-model="userdetail.user.email" readonly class="mt-1" />
                            </div>
                            <!-- <Button class="w-full" @click="handleUpdateOrganization">Update Organization</Button> -->
                        </CardContent>
                    </Card>

                    <!-- Address Card -->
                    <Card class="glass-card">
                        <CardHeader>
                            <CardTitle>Business Address</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div><label class="text-sm font-medium">Address Line 1</label><Textarea v-model="userdetail.principal_place_address"
                                    class="mt-1" readonly /></div>
        
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="text-sm font-medium">City</label><Input v-model="address.city"
                                        class="mt-1" readonly  /></div>
                                <div><label class="text-sm font-medium">State</label><Input v-model="address.state"
                                        class="mt-1" readonly/></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="text-sm font-medium">PIN Code</label><Input v-model="address.pincode"
                                        class="mt-1"  readonly /></div>
                                <div><label class="text-sm font-medium">Country</label><Input v-model="address.country"
                                        class="mt-1" readonly  /></div>
                            </div>
                            <div v-if="userdetail.user"><label class="text-sm font-medium">Phone Number</label><Input v-model="userdetail.user.phone_number"
                                    class="mt-1" readonly /></div>
                         
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <!-- Members Tab -->
            <TabsContent value="members">
                <Card class="glass-card">
                    <CardHeader class="w-full">
                        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <!-- Left: Title & Description -->
                            <div class="flex flex-col">
                                <CardTitle class="flex items-center space-x-2">
                                    <Users class="h-5 w-5 mr-2" /> Team Members
                                </CardTitle>
                                <p class="text-sm text-muted-foreground">Manage team access and permissions</p>
                            </div>

                            <!-- Right: Download Button -->
                            <InviteMemberDialog :onInvite="handleInviteMember" :isLoading="inviting" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="member in members" :key="member.id">
                                    <TableCell>
                                        <div class="flex items-center space-x-2">
                                            <div
                                                class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                                                {{member.name.split(' ').map(n => n[0]).join('')}}
                                            </div>
                                            <div>
                                                <p class="font-medium">{{ member.name }}</p>
                                                <p class="text-sm text-muted-foreground">{{ member.email }}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell class="flex items-center space-x-1">
                                        <component :is="getRoleIcon(member.role).component"
                                            :class="getRoleIcon(member.role).class" />

                                        <component v-bind="getRoleBadge(member.role).props">{{
                                            getRoleBadge(member.role).text }}</component>
                                    </TableCell>
                                    <TableCell>
                                        <component v-bind="getStatusBadge(member.status).props">{{
                                            getStatusBadge(member.status).text }}</component>
                                    </TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ member.lastActive }}</TableCell>
                                    <TableCell>
                                        <div class="flex items-center space-x-1">
                                            <Button variant="ghost" size="sm" @click="handleEditMember(member)">
                                                <Edit class="h-4 w-4" />
                                            </Button>
                                            <AlertDialog v-if="member.role !== 'Owner'">
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 class="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
                                                        <AlertDialogDescription> Are you sure you want to remove {{
                                                            member.name }} from the team? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction @click="handleDeleteMember(member)"> Delete
                                                            Member
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card class="glass-card">
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <p class="text-sm text-muted-foreground">Configure role access permissions</p>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div v-for="role in roles" :key="role" class="space-y-3">
                                <div class="flex items-center space-x-2">
                                    <!-- <component :is="getRoleIcon(role)" class="h-5 w-5" /> -->
                                    <component :is="getRoleIcon(role).component" :class="getRoleIcon(role).class" />
                                    <h4 class="font-medium">{{ role }}</h4>
                                </div>
                                <div class="space-y-2">
                                    <div v-for="permission in permissions" :key="permission"
                                        class="flex items-center justify-between">
                                        <span class="text-sm">{{ permission }}</span>
                                        <Switch v-model="rolePermissions[role][permission]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </TabsContent>

            <!-- Branding Tab -->
            <TabsContent value="branding">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <!-- Brand Assets -->
                    <Card class="glass-card">
                        <CardHeader>
                            <CardTitle class="flex items-center space-x-2">
                                <Palette class="h-5 w-5 mr-2" /> Brand Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div>
                                <label class="text-sm font-medium">Company Logo</label>
                                <div class="mt-2 flex items-center space-x-4">
                                    <div
                                        class="w-16 h-16 bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                                        <Upload class="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm" @click="handleUploadLogo">
                                            <Upload class="mr-2 h-4 w-4" /> Upload Logo
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PNG, JPG up to 2MB. Recommended: 200x200px
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="text-sm font-medium">Brand Name Display</label>
                                <Input v-model="branding.brandName" class="mt-1" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    This appears in KYC flows and customer-facing pages
                                </p>
                            </div>
                            <div>
                                <label class="text-sm font-medium">Primary Brand Color</label>
                                <Input v-model="branding.primaryColor" class="mt-1" />
                            </div>
                            <div>
                                <label class="text-sm font-medium">Custom Domain</label>
                                <Input v-model="branding.customDomain" class="mt-1" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Custom domain for KYC widget and verification pages
                                </p>
                            </div>

                        </CardContent>
                    </Card>

                    <!-- Widget Customization -->
                    <Card class="glass-card">
                        <CardHeader>
                            <CardTitle>Widget Customization</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div>
                                <label class="text-sm font-medium">Welcome Message</label>
                                <Textarea v-model="branding.welcomeMessage" class="mt-1" rows="3" />
                            </div>
                            <div>
                                <label class="text-sm font-medium">Privacy Policy URL</label>
                                <Input v-model="branding.privacyUrl" class="mt-1" />
                            </div>
                            <div>
                                <label class="text-sm font-medium">Terms of Service URL</label>
                                <Input v-model="branding.termsUrl" class="mt-1" />
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm">Show powered by OnePG</span>
                                    <Switch v-model="branding.showPoweredBy" />
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm">Enable dark mode</span>
                                    <Switch v-model="branding.darkMode" />
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm">Multi-language support</span>
                                    <Switch v-model="branding.multiLanguage" />
                                </div>
                            </div>
                            <Button class="w-full" @click="handlePreviewWidget">Preview Widget</Button>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <!-- Compliance Tab -->
            <TabsContent value="compliance">
                <div class="space-y-6">
                    <!-- DPDP Compliance -->
                    <Card class="glass-card">
                        <CardHeader>
                            <CardTitle class="flex items-center space-x-2">
                                <Shield class="h-5 w-5 mr-2" /> Data Protection & Privacy (DPDP)
                            </CardTitle>
                            <p class="text-sm text-muted-foreground">Configure consent management and data retention
                                policies</p>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="text-sm font-medium">Data Retention Period</label>
                                    <select v-model="compliance.retentionPeriod"
                                        class="mt-1 w-full p-2 border border-border rounded-lg bg-background">
                                        <option>7 years (recommended)</option>
                                        <option>5 years</option>
                                        <option>3 years</option>
                                        <option>Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-sm font-medium">Auto-deletion</label>
                                    <select v-model="compliance.autoDeletion"
                                        class="mt-1 w-full p-2 border border-border rounded-lg bg-background">
                                        <option>After retention period</option>
                                        <option>Manual deletion only</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="text-sm font-medium">Consent Notice Template</label>
                                <Textarea v-model="compliance.consentNotice" rows="4" class="mt-1" />
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm">Explicit consent required</span>
                                    <Switch v-model="compliance.explicitConsent" />
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm">Data export on request</span>
                                    <Switch v-model="compliance.dataExport" />
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm">Right to be forgotten</span>
                                    <Switch v-model="compliance.rightToBeForgotten" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card class="glass-card">
                        <CardHeader>
                            <CardTitle>Audit & Compliance</CardTitle>
                            <p class="text-sm text-muted-foreground">Download reports and audit trails</p>
                        </CardHeader>
                        <CardContent>
                            <!-- Download Buttons -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" class="h-20 flex-col">
                                            <Download class="h-6 w-6 mb-2" />
                                            <span>Audit Trail</span>
                                            <span class="text-xs text-muted-foreground">Last 90 days</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Download Audit Trail</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will download the audit trail report for the last 90 days. Continue
                                                with download?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction @click="handleDownloadAuditTrail">Download
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" class="h-20 flex-col">
                                            <Download class="h-6 w-6 mb-2" />
                                            <span>Data Report</span>
                                            <span class="text-xs text-muted-foreground">All stored data</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Download Data Report</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will download a comprehensive report of all stored data. Continue
                                                with download?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction @click="handleDownloadDataReport">Download
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" class="h-20 flex-col">
                                            <Download class="h-6 w-6 mb-2" />
                                            <span>Compliance Certificate</span>
                                            <span class="text-xs text-muted-foreground">Current status</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Download Compliance Certificate</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will download the current compliance certificate. Continue with
                                                download?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction @click="handleDownloadComplianceCertificate">Download
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <!-- Compliance Status -->
                            <div class="mt-6 p-4 bg-muted/20 rounded-xl">
                                <h4 class="font-medium mb-2">Compliance Status</h4>
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">RBI KYC Guidelines</span>
                                        <Badge class="bg-success/10 text-success border-success/20">Compliant</Badge>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">DPDP Act 2023</span>
                                        <Badge class="bg-success/10 text-success border-success/20">Compliant</Badge>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm">CERT-In Guidelines</span>
                                        <Badge class="bg-success/10 text-success border-success/20">Compliant</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </TabsContent>

        </Tabs>
    </div>
</template>
