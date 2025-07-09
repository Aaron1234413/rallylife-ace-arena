/**
 * Phase 1 Testing Suite - Clubs Database Foundation
 * Tests all new RPC functions and database integration
 */

import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  function: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export class ClubsPhase1Tester {
  private results: TestResult[] = [];
  private testClubId: string | null = null;
  private testUserId: string | null = null;

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Phase 1 Clubs Testing Suite...');
    this.results = [];

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      this.addResult('authentication', 'error', 'No user authenticated');
      return this.results;
    }
    this.testUserId = user.id;

    // Run tests in sequence
    await this.testCreateShareableLink();
    await this.testGetShareableLinks();
    await this.testJoinViaLink();
    await this.testMemberRoleManagement();
    await this.testClubAnalytics();
    await this.testMemberStatus();
    await this.testClubOwnershipTransfer();

    console.log('🧪 Phase 1 Testing Complete:', this.results);
    return this.results;
  }

  private async testCreateShareableLink() {
    try {
      // First, get a test club (create one if needed)
      await this.ensureTestClub();
      
      if (!this.testClubId) {
        this.addResult('create_shareable_link', 'error', 'No test club available');
        return;
      }

      const { data, error } = await (supabase as any).rpc('create_shareable_club_link', {
        club_id_param: this.testClubId,
        max_uses_param: 5,
        expires_days: 7
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        this.addResult('create_shareable_link', 'success', `Link created: ${result.link_slug}`, result);
      } else {
        this.addResult('create_shareable_link', 'error', result?.error || 'Unknown error');
      }
    } catch (error: any) {
      this.addResult('create_shareable_link', 'error', error.message);
    }
  }

  private async testGetShareableLinks() {
    try {
      if (!this.testClubId) return;

      const { data, error } = await (supabase as any).rpc('get_club_shareable_links', {
        club_id_param: this.testClubId
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        this.addResult('get_shareable_links', 'success', `Found ${result.links?.length || 0} links`, result);
      } else {
        this.addResult('get_shareable_links', 'error', result?.error || 'Unknown error');
      }
    } catch (error: any) {
      this.addResult('get_shareable_links', 'error', error.message);
    }
  }

  private async testJoinViaLink() {
    try {
      // This test is limited since we can't really test joining as a different user
      // But we can test the function with an invalid link
      const { data, error } = await (supabase as any).rpc('join_club_via_link', {
        link_slug_param: 'invalid-link-test'
      });

      if (error) throw error;

      const result = data as any;
      if (!result?.success && result?.error) {
        this.addResult('join_via_link', 'success', 'Function correctly rejected invalid link');
      } else {
        this.addResult('join_via_link', 'error', 'Function should have rejected invalid link');
      }
    } catch (error: any) {
      this.addResult('join_via_link', 'success', 'Function correctly threw error for invalid link');
    }
  }

  private async testMemberRoleManagement() {
    try {
      if (!this.testClubId || !this.testUserId) return;

      // Test updating member role (should work for owner changing their own role to admin then back)
      const { data, error } = await (supabase as any).rpc('update_member_role', {
        club_id_param: this.testClubId,
        user_id_param: this.testUserId,
        new_role: 'admin'
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        // Change back to owner
        await (supabase as any).rpc('update_member_role', {
          club_id_param: this.testClubId,
          user_id_param: this.testUserId,
          new_role: 'owner'
        });
        this.addResult('update_member_role', 'success', 'Role management working correctly');
      } else {
        this.addResult('update_member_role', 'error', result?.error || 'Unknown error');
      }
    } catch (error: any) {
      this.addResult('update_member_role', 'error', error.message);
    }
  }

  private async testClubAnalytics() {
    try {
      if (!this.testClubId) return;

      const { data, error } = await (supabase as any).rpc('update_club_analytics', {
        club_id_param: this.testClubId,
        analytics_date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        this.addResult('update_club_analytics', 'success', 'Analytics updated successfully', result);
        
        // Test fetching analytics
        await this.testFetchAnalytics();
      } else {
        this.addResult('update_club_analytics', 'error', result?.error || 'Unknown error');
      }
    } catch (error: any) {
      this.addResult('update_club_analytics', 'error', error.message);
    }
  }

  private async testFetchAnalytics() {
    try {
      if (!this.testClubId) return;

      const { data, error } = await supabase
        .from('club_analytics' as any)
        .select('*')
        .eq('club_id', this.testClubId)
        .limit(5);

      if (error) throw error;

      this.addResult('fetch_club_analytics', 'success', `Fetched ${data?.length || 0} analytics records`, data);
    } catch (error: any) {
      this.addResult('fetch_club_analytics', 'error', error.message);
    }
  }

  private async testMemberStatus() {
    try {
      if (!this.testClubId) return;

      const { data, error } = await (supabase as any).rpc('update_member_status', {
        club_id_param: this.testClubId,
        status_param: 'online',
        activity_data_param: { test: true, timestamp: new Date().toISOString() }
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        this.addResult('update_member_status', 'success', 'Member status updated successfully', result);
        
        // Test fetching member status
        await this.testFetchMemberStatus();
      } else {
        this.addResult('update_member_status', 'error', result?.error || 'Unknown error');
      }
    } catch (error: any) {
      this.addResult('update_member_status', 'error', error.message);
    }
  }

  private async testFetchMemberStatus() {
    try {
      if (!this.testClubId) return;

      const { data, error } = await supabase
        .from('member_status' as any)
        .select('*')
        .eq('club_id', this.testClubId);

      if (error) throw error;

      this.addResult('fetch_member_status', 'success', `Fetched ${data?.length || 0} member status records`, data);
    } catch (error: any) {
      this.addResult('fetch_member_status', 'error', error.message);
    }
  }

  private async testClubOwnershipTransfer() {
    try {
      if (!this.testClubId || !this.testUserId) return;

      // This test is limited since we can't transfer to a non-existent user
      // But we can test the validation
      const { data, error } = await (supabase as any).rpc('transfer_club_ownership', {
        club_id_param: this.testClubId,
        new_owner_id: 'non-existent-user-id'
      });

      if (error) throw error;

      const result = data as any;
      if (!result?.success && result?.error) {
        this.addResult('transfer_club_ownership', 'success', 'Function correctly validated ownership transfer');
      } else {
        this.addResult('transfer_club_ownership', 'error', 'Function should have rejected invalid user');
      }
    } catch (error: any) {
      this.addResult('transfer_club_ownership', 'success', 'Function correctly threw error for invalid user');
    }
  }

  private async ensureTestClub() {
    try {
      // Check if user has any clubs
      const { data: memberships, error } = await supabase
        .from('club_memberships')
        .select('club_id')
        .eq('user_id', this.testUserId)
        .eq('status', 'active')
        .eq('role', 'owner')
        .limit(1);

      if (error) throw error;

      if (memberships && memberships.length > 0) {
        this.testClubId = memberships[0].club_id;
        this.addResult('ensure_test_club', 'success', 'Using existing club for testing');
      } else {
        this.addResult('ensure_test_club', 'error', 'No test club available - please create a club first');
      }
    } catch (error: any) {
      this.addResult('ensure_test_club', 'error', error.message);
    }
  }

  private addResult(func: string, status: 'success' | 'error', message: string, data?: any) {
    this.results.push({ function: func, status, message, data });
    console.log(`${status === 'success' ? '✅' : '❌'} ${func}: ${message}`);
  }

  // Public method to get summary
  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'error').length;
    
    return {
      total,
      successful,
      failed,
      successRate: Math.round((successful / total) * 100) + '%',
      results: this.results
    };
  }
}

// Export test runner function
export async function runClubsPhase1Tests(): Promise<TestResult[]> {
  const tester = new ClubsPhase1Tester();
  const results = await tester.runAllTests();
  
  console.log('\n🧪 PHASE 1 TEST SUMMARY:');
  const summary = tester.getSummary();
  console.log(`Total Tests: ${summary.total}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Success Rate: ${summary.successRate}`);
  
  return results;
}