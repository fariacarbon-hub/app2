#!/usr/bin/env python3
import os
import sys
import json
import asyncio
from emergentintegrations.payments.stripe.checkout import StripeCheckout

async def create_checkout_session(price_id, success_url, cancel_url, metadata):
    """Create a Stripe checkout session"""
    try:
        api_key = os.getenv('STRIPE_API_KEY')
        if not api_key:
            raise ValueError("STRIPE_API_KEY not found")
        
        webhook_url = os.getenv('WEBHOOK_URL', 'https://your-app.emergent.sh/api/payments/webhook/stripe')
        
        stripe_checkout = StripeCheckout(api_key, webhook_url)
        
        # Create checkout session request
        request_data = {
            'price_id': price_id,
            'success_url': success_url,
            'cancel_url': cancel_url,
            'metadata': metadata
        }
        
        session = await stripe_checkout.create_checkout_session_with_price_id(request_data)
        
        return {
            'success': True,
            'session_id': session.session_id,
            'url': session.url
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

async def get_checkout_status(session_id):
    """Get checkout session status"""
    try:
        api_key = os.getenv('STRIPE_API_KEY')
        webhook_url = os.getenv('WEBHOOK_URL', 'https://your-app.emergent.sh/api/payments/webhook/stripe')
        
        stripe_checkout = StripeCheckout(api_key, webhook_url)
        
        status = await stripe_checkout.get_checkout_status(session_id)
        
        return {
            'success': True,
            'status': status.status,
            'payment_status': status.payment_status,
            'amount_total': status.amount_total,
            'currency': status.currency
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

async def handle_webhook(body, signature):
    """Handle Stripe webhook"""
    try:
        api_key = os.getenv('STRIPE_API_KEY')
        webhook_url = os.getenv('WEBHOOK_URL', 'https://your-app.emergent.sh/api/payments/webhook/stripe')
        
        stripe_checkout = StripeCheckout(api_key, webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        return {
            'success': True,
            'event_type': webhook_response.event_type,
            'session_id': webhook_response.session_id,
            'payment_status': webhook_response.payment_status
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No action specified'}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == 'create_session':
        if len(sys.argv) < 6:
            print(json.dumps({'success': False, 'error': 'Missing parameters'}))
            sys.exit(1)
        
        price_id = sys.argv[2]
        success_url = sys.argv[3]
        cancel_url = sys.argv[4]
        metadata = json.loads(sys.argv[5])
        
        result = create_checkout_session(price_id, success_url, cancel_url, metadata)
        print(json.dumps(result))
        
    elif action == 'get_status':
        if len(sys.argv) < 3:
            print(json.dumps({'success': False, 'error': 'Missing session_id'}))
            sys.exit(1)
            
        session_id = sys.argv[2]
        result = get_checkout_status(session_id)
        print(json.dumps(result))
        
    else:
        print(json.dumps({'success': False, 'error': 'Invalid action'}))
        sys.exit(1)