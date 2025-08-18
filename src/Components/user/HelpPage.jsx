import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  Upload,
  User,
  Settings,
  Shield,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Lock,
  Mail,
  HelpCircle,
  Book,
  Video,
  Users,
  Bell,
  Flag,
  Smartphone,
  Globe,
  Star,
} from "lucide-react";

const HelpPage = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const categories = [
    { id: "getting-started", name: "Getting Started", icon: Play },
    { id: "account", name: "Account & Profile", icon: User },
    { id: "uploading", name: "Uploading Videos", icon: Upload },
    { id: "watching", name: "Watching Videos", icon: Eye },

    { id: "privacy", name: "Privacy & Safety", icon: Shield },
    { id: "mobile", name: "Mobile App", icon: Smartphone },
    { id: "troubleshooting", name: "Troubleshooting", icon: Settings },
  ];

  const helpSections = {
    "getting-started": [
      {
        title: "Welcome to Vidzio",
        content: `Vidzio is your premier destination for sharing and discovering amazing videos. Whether you're a content creator or a viewer, our platform makes it easy to connect through video content.

Key features include:
• Upload and share your videos with the world
• Discover trending and popular content
• Build your community with followers and subscriptions
• Interact through likes, comments, and shares
• Customize your profile and preferences`,
      },
      {
        title: "Creating Your Account",
        content: `Getting started with Vidzio is simple:

1. Click "Sign Up" on the homepage
2. Fill in your details (Full Name, Username, Email, Password)
3. Upload a profile picture (required)
4. Add a cover image (optional)
5. Verify your email address
6. Start exploring and uploading!

Your username will be your unique identifier on Vidzio, so choose something memorable!`,
      },
      {
        title: "First Steps After Registration",
        content: `Once you've created your account:

1. Complete your profile by adding a bio and social links
2. Explore trending videos to get familiar with the platform
3. Follow creators you're interested in
4. Upload your first video to start building your presence
5. Customize your notification preferences
6. Join the community by commenting and engaging with content`,
      },
    ],
    account: [
      {
        title: "Managing Your Profile",
        content: `Your profile is your identity on Vidzio. Here's how to manage it:

• **Profile Picture**: Upload a clear, high-quality image (max 5MB)
• **Cover Image**: Add a banner to personalize your channel (max 10MB)

• **Display Name**: This appears on your videos and comments

To edit your profile, go to Settings → Profile Settings.`,
      },
      {
        title: "Account Security",
        content: `Keep your account secure:

• Use a strong, unique password (minimum 6 characters)
• Enable two-factor authentication when available
• Don't share your login credentials
• Log out from shared devices
• Report suspicious activity immediately
• Review your account activity regularly

If you suspect your account has been compromised, change your password immediately and contact support.`,
      },
      {
        title: "Privacy Settings",
        content: `Control who can see your content and interact with you:


• **Video Privacy**: Set default privacy for your uploads


Access these settings from your account dashboard.`,
      },
    ],
    uploading: [
      {
        title: "Video Upload Guidelines",
        content: `Upload high-quality videos to Vidzio:

**Supported Formats**: MP4, AVI, MOV, WMV, FLV
**Maximum File Size**: 2GB per video
**Recommended Resolution**: 1080p (1920x1080) or higher
**Aspect Ratio**: 16:9 for best compatibility

**Before uploading:**
• Ensure your video is original content or you have proper rights
• Check video and audio quality
• Create an eye-catching thumbnail
• Prepare a descriptive title and description`,
      },
      {
        title: "Optimizing Your Videos",
        content: `Make your videos discoverable:

**Title**: Use clear, descriptive titles with relevant keywords
**Description**: Provide detailed information about your video content
**Tags**: Add relevant tags to help users find your content
**Thumbnail**: Upload a custom thumbnail that represents your video
**Category**: Select the most appropriate category

**Best Practices:**
• Use good lighting and clear audio
• Keep content engaging from the first few seconds
• Add subtitles for accessibility
• Include calls-to-action for engagement`,
      },
      {
        title: "Video Processing & Publishing",
        content: `After uploading your video:

1. **Processing**: Videos are automatically processed for different qualities
2. **Review**: Check your video preview before publishing
3. **Scheduling**: Publish immediately or schedule for later
4. **Sharing**: Share your video across social media platforms

**Processing times vary based on:**
• Video length and file size
• Current server load
• Video resolution and format

You'll receive a notification when processing is complete.`,
      },
    ],
    watching: [
      {
        title: "Discovering Content",
        content: `Find amazing videos on Vidzio:

**Home Feed**: Personalized recommendations based on your interests
**Trending**: Popular videos across the platform
**Categories**: Browse videos by topic or genre
**Search**: Use keywords to find specific content
**Following**: See latest videos from creators you subscribe

**Discovery Tips:**
• Like videos you enjoy to improve recommendations
• Subscribe to your favorite creators
• Explore different categories
• Use the search filters for better results`,
      },
      {
        title: "Video Player Features",
        content: `Our video player includes:

• **Quality Selection**: Choose from available video qualities
• **Playback Speed**: Adjust speed from 0.25x to 2x
• **Full Screen**: Watch in full screen mode
• **Volume Control**: Adjust audio levels
• **Subtitles**: Enable closed captions when available
• **Picture-in-Picture**: Continue watching while browsing

**Keyboard Shortcuts:**
• Spacebar: Play/Pause
• Arrow Keys: Skip forward/backward
`,
      },
      {
        title: "Engagement Features",
        content: `Interact with videos and creators:

**Likes**: Show appreciation for content you enjoy
**Comments**: Share your thoughts and engage with the community
**Shares**: Share videos with friends and on social media
**Subscriptions**: Follow creators to see their latest content
**Playlists**: Create custom playlists to organize your favorite videos

**Community Guidelines:**
• Be respectful in comments
• Provide constructive feedback
• Avoid spam or self-promotion
`,
      },
    ],
    community: [
      {
        title: "Building Your Community",
        content: `Grow your presence on Vidzio:

**For Creators:**
• Post consistently to keep your audience engaged
• Respond to comments on your videos
• Collaborate with other creators
• Share behind-the-scenes content
• Host live streams when available

**For Viewers:**
• Support creators by liking and sharing their content
• Leave thoughtful comments
• Suggest video ideas
• Join creator communities and discussions`,
      },
      {
        title: "Following & Subscribers",
        content: `Connect with your favorite creators:

**Following**: Get notified when creators upload new content
**Subscribers**: Build your audience as a creator
**Notifications**: Choose how you want to be notified about new content

**Growing Your Subscribers:**
• Create high-quality, consistent content
• Engage with your audience
• Use relevant tags and descriptions
• Promote your channel on other platforms
• Collaborate with other creators`,
      },
      {
        title: "Comments & Discussions",
        content: `Engage in meaningful conversations:

**Comment Guidelines:**
• Be respectful and constructive
• Stay on topic
• Avoid spam or promotional content
• Don't share personal information
• Report inappropriate comments

**Managing Comments (for creators):**
• Moderate comments on your videos

• Heart comments you appreciate
`,
      },
    ],
    privacy: [
      {
        title: "Content Guidelines",
        content: `Vidzio maintains a safe environment for all users:

**Prohibited Content:**
• Violent or graphic content
• Hate speech or harassment
• Adult or sexual content
• Copyright infringement
• Spam or misleading content
• Dangerous or harmful activities

**Content Standards:**
• Original content or proper attribution
• Age-appropriate material
• Respectful community interaction
• Accurate information and descriptions`,
      },
      {
        title: "Reporting & Safety",
        content: `Report content that violates our guidelines:



**What We Review:**
• Copyright violations
• Inappropriate content
• Harassment or bullying
• Spam or scam content
• Privacy violations

Our moderation team reviews all reports within 24-48 hours.`,
      },
      {
        title: "Privacy Protection",
        content: `We protect your privacy:

**Data We Collect:**
• Account information you provide
• Usage data and preferences
• Interaction history on the platform

**How We Use Your Data:**
• Improve your experience with personalized recommendations
• Provide customer support
• Ensure platform security and safety
• Send important updates and notifications

**Your Rights:**
• Access your data
• Request data deletion
• Update your information
• Control privacy settings`,
      },
    ],
    mobile: [
      {
        title: "Mobile Experience",
        content: `Access Vidzio on your mobile device:

**Mobile Web:**
• Fully responsive website works on all devices
• Optimized for touch navigation
• Fast loading and smooth playback
• All desktop features available

**Coming Soon:**
• Native iOS and Android apps
• Offline video downloads
• Push notifications
• Enhanced mobile features

**Mobile Tips:**
• Use Wi-Fi for uploading large videos
• Enable mobile data saving if needed
• Optimize videos for mobile viewing`,
      },
      {
        title: "Mobile Upload Tips",
        content: `Uploading from mobile devices:

**Before Uploading:**
• Ensure stable internet connection
• Record in landscape mode for best quality
• Check available storage space
• Use good lighting and audio

**Mobile Recording Tips:**
• Hold device steady or use a tripod
• Clean your camera lens
• Record in highest available quality
• Consider external microphones for better audio

**Data Usage:**
• Uploading uses significant data
• Use Wi-Fi when possible
• Monitor your data usage`,
      },
    ],
    troubleshooting: [
      {
        title: "Common Issues",
        content: `Solutions to frequent problems:

**Video Won't Upload:**
• Check file format and size limits
• Verify internet connection
• Try a different browser
• Clear browser cache and cookies
• Disable browser extensions

**Video Won't Play:**
• Refresh the page
• Update your browser
• Check internet connection
• Disable ad blockers temporarily
• Try a different device`,
      },
      {
        title: "Browser Compatibility",
        content: `Vidzio works best with modern browsers:

**Supported Browsers:**
• Chrome (recommended)
• Firefox
• Safari
• Edge
• Opera

**For Best Experience:**
• Keep your browser updated
• Enable JavaScript
• Allow cookies from Vidzio
• Ensure stable internet connection
• Clear cache regularly`,
      },
      {
        title: "Account Issues",
        content: `Resolving account problems:

**Can't Log In:**
• Check username/email and password
• Use "Forgot Password" if needed
• Clear browser cache
• Try a different browser
• Check if account is suspended

**Email Not Received:**
• Check spam/junk folders
• Verify email address is correct
• Add Vidzio to your contacts
• Try a different email provider
• Contact support if issues persist`,
      },
    ],
  };

  const filteredSections =
    helpSections[activeCategory]?.filter(
      (section) =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const handleContactSupport = () => {
    window.location.href =
      "mailto:vidzio.app@gmail.com?subject=Vidzio Support Request&body=Hello Vidzio Support Team,%0D%0A%0D%0APlease describe your issue or question here:%0D%0A%0D%0A";
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4"></div>
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              Help & Support
            </h1>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } max-w-2xl mx-auto`}
            >
              Find answers to your questions and learn how to make the most of
              Vidzio
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-sm p-6 sticky top-8`}
            >
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                Categories
              </h3>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeCategory === category.id
                          ? `${
                              isDarkMode
                                ? "bg-indigo-900 text-indigo-300"
                                : "bg-indigo-50 text-indigo-700"
                            } border-l-4 border-indigo-500`
                          : `${
                              isDarkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {category.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-sm`}
            >
              {/* Category Header */}
              <div
                className={`p-6 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex items-center">
                  {React.createElement(
                    categories.find((c) => c.id === activeCategory)?.icon ||
                      HelpCircle,
                    {
                      className: "h-6 w-6 text-indigo-600 mr-3",
                    }
                  )}
                  <h2
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {categories.find((c) => c.id === activeCategory)?.name}
                  </h2>
                </div>
              </div>

              {/* Help Sections */}
              <div className="p-6">
                {filteredSections.length === 0 ? (
                  <div className="text-center py-12">
                    <Search
                      className={`h-12 w-12 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      } mx-auto mb-4`}
                    />
                    <h3
                      className={`text-lg font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      } mb-2`}
                    >
                      No results found
                    </h3>
                    <p
                      className={`${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Try adjusting your search terms
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSections.map((section, index) => (
                      <div
                        key={index}
                        className={`border ${
                          isDarkMode ? "border-gray-700" : "border-gray-200"
                        } rounded-lg`}
                      >
                        <button
                          onClick={() => toggleSection(index)}
                          className={`w-full px-6 py-4 text-left flex items-center justify-between ${
                            isDarkMode
                              ? "hover:bg-gray-700"
                              : "hover:bg-gray-50"
                          } transition-colors`}
                        >
                          <h3
                            className={`text-lg font-semibold ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {section.title}
                          </h3>
                          {expandedSection === index ? (
                            <ChevronDown
                              className={`h-5 w-5 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            />
                          ) : (
                            <ChevronRight
                              className={`h-5 w-5 ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            />
                          )}
                        </button>
                        {expandedSection === index && (
                          <div className="px-6 pb-6">
                            <div className="prose prose-gray max-w-none">
                              <div
                                className={`whitespace-pre-line ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                } leading-relaxed`}
                              >
                                {section.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div
              className={`mt-8 bg-gradient-to-r from-gray-500 via-gray-700 to-gray-950 rounded-xl p-8 text-white`}
            >
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here
                  to help you with any questions or issues.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleContactSupport}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
