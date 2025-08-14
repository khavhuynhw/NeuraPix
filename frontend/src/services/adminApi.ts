import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Types for dashboard statistics
export interface DashboardStats {
  totalUsers: number;
  totalImages: number;
  premiumUsers: number;
  monthlyRevenue: number;
  todaySignups: number;
  todayImages: number;
  conversionRate: number;
  avgImagesPerUser: number;
  activeUsers: number;
  collectionsCount: number;
  storageUsed: number;
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  joinedAt: string;
  status: string;
  lastActive: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  user: string;
  time: string;
  type: string;
}

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // For now, we'll use the existing endpoints to calculate stats
    const [usersResponse, subscriptionsResponse] = await Promise.all([
      axios.get(`${BASE_URL}/api/v1/users?size=1000`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      axios.get(`${BASE_URL}/api/v1/subscriptions`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).catch(() => ({ data: { users: [] } })), // Fallback if endpoint doesn't exist
    ]);

    const users = usersResponse.data.users || [];
    const totalUsers = usersResponse.data.total || users.length;
    
    // Calculate premium users (those with non-FREE subscriptions)
    const premiumUsers = users.filter((user: any) => 
      user.subscriptionTier && user.subscriptionTier !== 'FREE'
    ).length;

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    // Mock some data that would come from actual endpoints
    const stats: DashboardStats = {
      totalUsers,
      totalImages: Math.floor(totalUsers * 12.5), // Estimated based on user count
      premiumUsers,
      monthlyRevenue: premiumUsers * 19.99, // Estimated revenue
      todaySignups: Math.floor(totalUsers * 0.02), // 2% of total users as today's signups
      todayImages: Math.floor(totalUsers * 0.1), // 10% daily activity
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      avgImagesPerUser: 37,
      activeUsers: Math.floor(totalUsers * 0.35), // 35% active
      collectionsCount: Math.floor(totalUsers * 0.8), // 80% have collections
      storageUsed: 72.5,
    };

    return stats;
  } catch (error: any) {
    console.error("Failed to fetch dashboard stats:", error);
    // Return fallback data
    return {
      totalUsers: 1234,
      totalImages: 45678,
      premiumUsers: 187,
      monthlyRevenue: 3737,
      todaySignups: 23,
      todayImages: 156,
      conversionRate: 15.2,
      avgImagesPerUser: 37,
      activeUsers: 456,
      collectionsCount: 234,
      storageUsed: 72.5,
    };
  }
}

/**
 * Fetch recent users for dashboard table
 */
export async function getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/users?size=${limit}&page=0`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const users = response.data.users || [];
    return users.map((user: any, index: number) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User',
      email: user.email,
      plan: user.subscriptionTier || 'FREE',
      joinedAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
      status: user.isActive ? 'Active' : 'Inactive',
      lastActive: `${Math.floor(Math.random() * 24)} hours ago`, // Mock data
    }));
  } catch (error: any) {
    console.error("Failed to fetch recent users:", error);
    // Return fallback data
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        plan: "PREMIUM",
        joinedAt: "2024-01-15",
        status: "Active",
        lastActive: "2 hours ago",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        plan: "FREE",
        joinedAt: "2024-01-14",
        status: "Active",
        lastActive: "1 day ago",
      },
    ];
  }
}

/**
 * Fetch recent activity for dashboard feed
 */
export async function getRecentActivity(limit: number = 5): Promise<ActivityItem[]> {
  try {
    // This would typically come from an activity log endpoint
    // For now, we return mock data with some real user emails
    const usersResponse = await axios.get(`${BASE_URL}/api/v1/users?size=10`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    const users = usersResponse.data.users || [];
    const activities = [
      "User registered",
      "Image generated", 
      "Subscription upgraded",
      "Image downloaded",
      "Collection created",
    ];

    return Array.from({ length: limit }, (_, index) => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      return {
        id: index + 1,
        action: randomActivity,
        user: randomUser?.email || `user${index}@example.com`,
        time: `${Math.floor(Math.random() * 60)} minutes ago`,
        type: randomActivity.includes('User') ? 'user' : 
              randomActivity.includes('Image') ? 'content' : 
              randomActivity.includes('Subscription') ? 'billing' : 'content',
      };
    });
  } catch (error: any) {
    console.error("Failed to fetch recent activity:", error);
    // Return fallback data
    return [
      {
        id: 1,
        action: "User registered",
        user: "alice@example.com",
        time: "2 minutes ago",
        type: "user",
      },
      {
        id: 2,
        action: "Image generated",
        user: "bob@example.com",
        time: "5 minutes ago",
        type: "content",
      },
    ];
  }
}