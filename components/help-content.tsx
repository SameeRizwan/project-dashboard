"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    MagnifyingGlass,
    BookOpen,
    Lightbulb,
    ChatCircle,
    EnvelopeSimple,
    ArrowSquareOut,
    Question,
} from "@phosphor-icons/react/dist/ssr"

const FAQ_ITEMS = [
    {
        question: "How do I create a new project?",
        answer:
            "Click the 'New Project' button in the Projects page header. You'll be guided through a wizard to set up your project with a name, dates, priority, and initial tasks.",
    },
    {
        question: "Can I invite team members to my workspace?",
        answer:
            "Yes! Go to Settings > Team Members to invite collaborators by email. They'll receive an invitation to join your workspace.",
    },
    {
        question: "How do I use project templates?",
        answer:
            "Navigate to the Templates page from the sidebar. Browse available templates and click 'Use Template' to create a new project with pre-configured tasks.",
    },
    {
        question: "How are tasks organized in the timeline view?",
        answer:
            "Tasks are displayed as horizontal bars on the timeline. You can drag them to change their dates, and expand/collapse projects to see their tasks.",
    },
    {
        question: "Can I filter projects by status or priority?",
        answer:
            "Yes! Use the filter popover in the Projects page header to filter by status, priority, tags, or team members.",
    },
    {
        question: "How do I track project performance?",
        answer:
            "Visit the Performance page to see metrics like completion rates, task velocity, and project progress charts.",
    },
    {
        question: "Is my data secure?",
        answer:
            "Yes, all data is stored securely in Firebase with authentication. Only authorized users can access your workspace.",
    },
    {
        question: "Can I export my project data?",
        answer:
            "Export functionality is coming soon. In the meantime, you can view all your data in the dashboard.",
    },
]

const RESOURCES = [
    {
        title: "Getting Started Guide",
        description: "Learn the basics of project management",
        icon: <BookOpen className="h-5 w-5" />,
        href: "#",
    },
    {
        title: "Best Practices",
        description: "Tips for effective project management",
        icon: <Lightbulb className="h-5 w-5" />,
        href: "#",
    },
    {
        title: "Community Forum",
        description: "Connect with other users",
        icon: <ChatCircle className="h-5 w-5" />,
        href: "#",
    },
]

export function HelpContent() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredFAQ = FAQ_ITEMS.filter(
        (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-auto">
            {/* Header */}
            <div className="border-b border-border/40 px-6 py-4">
                <h1 className="text-2xl font-bold">Help Center</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Find answers and get support
                </p>
            </div>

            <div className="p-6 max-w-4xl space-y-8">
                {/* Search */}
                <div className="relative">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 text-base"
                    />
                </div>

                {/* Quick Links */}
                <div className="grid gap-4 md:grid-cols-3">
                    {RESOURCES.map((resource) => (
                        <Card
                            key={resource.title}
                            className="hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {resource.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium group-hover:text-primary transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {resource.description}
                                    </p>
                                </div>
                                <ArrowSquareOut className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Question className="h-5 w-5 text-primary" />
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </div>
                        <CardDescription>Common questions and answers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredFAQ.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No results found for "{searchQuery}"</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {filteredFAQ.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                    <CardHeader>
                        <CardTitle>Still need help?</CardTitle>
                        <CardDescription>
                            Our support team is here to assist you
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4">
                        <Button className="gap-2">
                            <EnvelopeSimple className="h-4 w-4" />
                            Contact Support
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <ChatCircle className="h-4 w-4" />
                            Start Live Chat
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
