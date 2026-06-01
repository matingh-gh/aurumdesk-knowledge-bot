# Trading Risk Policy

This document defines the fictional internal trading risk rules used by AurumDesk AI demo accounts.

## Daily Drawdown Limit

The maximum daily drawdown limit is 3% of starting equity for the trading day.

If an account reaches the 3% daily drawdown limit, trading must stop for the rest of that day.

## Maximum Total Drawdown

The maximum total drawdown limit is 8% of initial account balance.

If an account reaches the 8% total drawdown limit, the account must be reviewed by the risk team before any further trading activity.

## Position Size Rule

No single position should risk more than 1% of current account equity.

If market volatility is unusually high, the recommended risk per position should be reduced to 0.5%.

## News Event Rule

Trading is restricted during major scheduled news events.

For high-impact events such as central bank rate decisions, CPI releases, NFP reports, or unexpected geopolitical shocks, traders should avoid opening new positions 15 minutes before and 15 minutes after the event.

## Stop Loss Requirement

Every trade must have a predefined invalidation level or stop loss.

Trades without a defined risk level are considered policy violations.

## Risk Review Process

If a trader violates a risk rule, the support or risk team should:

1. Pause trading access if required.
2. Review the trade history.
3. Identify whether the violation was technical, behavioral, or caused by unclear instructions.
4. Document the case.
5. Decide whether the account can continue, needs restrictions, or requires termination.
