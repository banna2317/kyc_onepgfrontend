<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";

import { Button } from "@/components/ui/button";
import  GlassCard from "@/components/GlassCard.vue";
import Navigation from "@/components/Navigation.vue";
import { Book, Code, Zap, Shield, Key, Webhook } from "lucide-vue-next";

interface DocSection {
  title: string;
  icon: any;
  items: string[];
}

const docSections = ref<DocSection[]>([
  {
    title: "Getting Started",
    icon: Zap,
    items: ["Quickstart Guide", "API Overview", "Authentication", "Environment Setup"]
  },
  {
    title: "API Reference",
    icon: Code,
    items: ["Verification Endpoints", "Webhook Events", "Error Handling", "Rate Limits"]
  },
  {
    title: "SDKs & Integration",
    icon: Key,
    items: ["Node.js SDK", "Python SDK", "React Widget", "REST API Examples"]
  },
  {
    title: "Compliance & Security",
    icon: Shield,
    items: ["Data Retention", "CERT-In Guidelines", "RBI Compliance", "Audit Logs"]
  }
]);
</script>

<template>
     <Navigation />
<div class="min-h-screen pt-24 pb-12">
  <div class="container mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-16">
      <h1 class="text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
        Developer Documentation
      </h1>
      <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
        Everything you need to integrate OnePG SecureID into your application. 
        From quick setup to advanced configurations.
      </p>
    </div>

    <!-- Documentation Sections -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      <GlassCard
        v-for="(section, index) in docSections"
        :key="index"
        class="p-6 group hover:scale-105 transition-all duration-300"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <component :is="section.icon" class="h-5 w-5" />
          </div>
          <h3 class="font-semibold">{{ section.title }}</h3>
        </div>
        <ul class="space-y-2">
          <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
            <a href="#" class="text-sm text-muted-foreground hover:text-primary transition-colors">
              {{ item }}
            </a>
          </li>
        </ul>
      </GlassCard>
    </div>

    <!-- CTA Card -->
    <GlassCard class="p-12 text-center">
      <h2 class="text-3xl font-bold mb-6">Ready to start building?</h2>
      <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
        Get your API keys and start testing in our sandbox environment.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/onboarding">
          <Button variant="hero" size="lg">Get API Keys</Button>
        </Link>
        <Link to="/services">
          <Button variant="accent" size="lg">Browse Services</Button>
        </Link>
      </div>
    </GlassCard>
  </div>
</div>
</template>
