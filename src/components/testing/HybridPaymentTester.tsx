import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Coins,
  DollarSign
} from 'lucide-react';
import { InteractiveHybridPaymentSelector } from '@/components/payments/InteractiveHybridPaymentSelector';
import { PaymentConfirmationDialog } from '@/components/payments/PaymentConfirmationDialog';

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: "Zero Tokens",
    description: "User has no tokens - should force full cash payment",
    tokenBalance: 0,
    serviceCost: 100,
    expectedBehavior: "100% cash payment required"
  },
  {
    name: "Partial Coverage",
    description: "User has some tokens but not enough to cover full cost",
    tokenBalance: 75,
    serviceCost: 150,
    expectedBehavior: "75 tokens + $0.75 cash"
  },
  {
    name: "Full Coverage",
    description: "User has enough tokens to cover entire cost",
    tokenBalance: 200,
    serviceCost: 100,
    expectedBehavior: "Can pay with 100 tokens or mix"
  },
  {
    name: "Exact Match",
    description: "User has exactly the required tokens",
    tokenBalance: 100,
    serviceCost: 100,
    expectedBehavior: "Can pay with exactly 100 tokens"
  },
  {
    name: "Edge Case - 1 Token",
    description: "User has minimal tokens",
    tokenBalance: 1,
    serviceCost: 50,
    expectedBehavior: "1 token + $0.49 cash"
  },
  {
    name: "High Cost Service",
    description: "Expensive service to test large amounts",
    tokenBalance: 500,
    serviceCost: 1000,
    expectedBehavior: "500 tokens + $5.00 cash"
  }
];

export function HybridPaymentTester() {
  const [currentScenario, setCurrentScenario] = useState(TEST_SCENARIOS[0]);
  const [customTokenBalance, setCustomTokenBalance] = useState(currentScenario.tokenBalance);
  const [customServiceCost, setCustomServiceCost] = useState(currentScenario.serviceCost);
  const [paymentSelection, setPaymentSelection] = useState({ tokens: 0, usd: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    scenario: string;
    passed: boolean;
    details: string;
  }>>([]);

  const runScenarioTest = (scenario: typeof TEST_SCENARIOS[0]) => {
    setCurrentScenario(scenario);
    setCustomTokenBalance(scenario.tokenBalance);
    setCustomServiceCost(scenario.serviceCost);
    
    // Reset payment selection to trigger recalculation
    setTimeout(() => {
      const maxUsableTokens = Math.min(scenario.tokenBalance, scenario.serviceCost);
      const expectedTokens = maxUsableTokens;
      const expectedCash = (scenario.serviceCost - expectedTokens) * 0.01;
      
      setPaymentSelection({ tokens: expectedTokens, usd: expectedCash });
      
      // Record test result
      const testPassed = validateScenario(scenario, { tokens: expectedTokens, usd: expectedCash });
      setTestResults(prev => [
        ...prev.filter(r => r.scenario !== scenario.name),
        {
          scenario: scenario.name,
          passed: testPassed,
          details: `Expected: ${scenario.expectedBehavior}, Got: ${expectedTokens} tokens + $${expectedCash.toFixed(2)}`
        }
      ]);
    }, 100);
  };

  const validateScenario = (scenario: typeof TEST_SCENARIOS[0], payment: { tokens: number; usd: number }) => {
    const totalCost = scenario.serviceCost * 0.01;
    const actualTotal = payment.usd + (payment.tokens * 0.01);
    
    // Check if payment total matches service cost (within 1 cent tolerance)
    const totalMatches = Math.abs(actualTotal - totalCost) < 0.01;
    
    // Check if tokens used don't exceed available or required
    const tokensValid = payment.tokens <= scenario.tokenBalance && payment.tokens <= scenario.serviceCost;
    
    return totalMatches && tokensValid;
  };

  const runAllTests = () => {
    setTestResults([]);
    TEST_SCENARIOS.forEach((scenario, index) => {
      setTimeout(() => runScenarioTest(scenario), index * 500);
    });
  };

  const handleTestBooking = () => {
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Hybrid Payment System Tester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Test Scenarios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Predefined Test Scenarios</h3>
              <Button onClick={runAllTests} variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEST_SCENARIOS.map((scenario) => {
                const result = testResults.find(r => r.scenario === scenario.name);
                return (
                  <Card key={scenario.name} className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => runScenarioTest(scenario)}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{scenario.name}</h4>
                        {result && (
                          <Badge variant={result.passed ? "default" : "destructive"}>
                            {result.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">{scenario.tokenBalance} tokens</Badge>
                        <Badge variant="outline">{scenario.serviceCost} token cost</Badge>
                      </div>
                      {result && (
                        <p className="text-xs text-muted-foreground">{result.details}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Custom Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Test Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tokenBalance">User Token Balance</Label>
                <Input
                  id="tokenBalance"
                  type="number"
                  value={customTokenBalance}
                  onChange={(e) => setCustomTokenBalance(Number(e.target.value))}
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceCost">Service Token Cost</Label>
                <Input
                  id="serviceCost"
                  type="number"
                  value={customServiceCost}
                  onChange={(e) => setCustomServiceCost(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Selector Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Selection Test</h3>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Testing scenario: <strong>{currentScenario.name}</strong> - {currentScenario.description}
              </AlertDescription>
            </Alert>

            <InteractiveHybridPaymentSelector
              serviceTokenCost={customServiceCost}
              availableTokens={customTokenBalance}
              onPaymentChange={setPaymentSelection}
              onRefreshTokens={() => {
                console.log('Refresh tokens clicked');
              }}
            />

            {/* Payment Summary */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Current Payment Selection</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span>Tokens: {paymentSelection.tokens}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>Cash: ${paymentSelection.usd.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Total Service Cost:</span>
                    <span>${(customServiceCost * 0.01).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payment Total:</span>
                    <span>${(paymentSelection.usd + (paymentSelection.tokens * 0.01)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleTestBooking} className="w-full">
              Test Booking Confirmation
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result) => (
                    <Alert key={result.scenario} variant={result.passed ? "default" : "destructive"}>
                      <div className="flex items-center gap-2">
                        {result.passed ? 
                          <CheckCircle className="h-4 w-4" /> : 
                          <XCircle className="h-4 w-4" />
                        }
                        <span className="font-medium">{result.scenario}</span>
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? "PASS" : "FAIL"}
                        </Badge>
                      </div>
                      <AlertDescription className="mt-1">
                        {result.details}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog Test */}
      <PaymentConfirmationDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        loading={false}
        serviceDetails={{
          name: `Test Service - ${currentScenario.name}`,
          type: "Test Service",
          description: currentScenario.description,
          duration: 60
        }}
        paymentBreakdown={{
          tokens: paymentSelection.tokens,
          cash: paymentSelection.usd,
          totalServiceValue: customServiceCost * 0.01,
          savings: (customServiceCost - paymentSelection.tokens) * 0.01 - paymentSelection.usd,
          savingsPercentage: paymentSelection.tokens > 0 ? (paymentSelection.tokens / customServiceCost) * 100 : 0
        }}
        userTokenBalance={customTokenBalance}
        onConfirm={() => {
          console.log('Test booking confirmed:', {
            scenario: currentScenario.name,
            payment: paymentSelection,
            userBalance: customTokenBalance,
            serviceCost: customServiceCost
          });
          setShowConfirmDialog(false);
        }}
      />
    </div>
  );
}