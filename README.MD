# 2C2P Payment POC

## Official guide of server to server payment process

1. Customer checks out and proceeds to pay.

2. Merchant is required to request a payment token from 2C2P.

3. 2C2P returns the payment token to the merchant.

4. Merchant requests a payment option with payment token. (Optional)

5. 2C2P returns available payment option. (Optional)

6. Merchant requests payment option details with payment token and Group/Category Code (Optional)

7. 2C2P returns payment option details. (Optional)

8. Merchant display available payment options (Optional)

9. Customer select payment options and submit payment (Not Needed - payment info stored in system)

10. Merchant requests payment with payment token and payment information.

11. 2C2P returns payment response to merchant.

12. 2C2P returns backend response to merchant if merchant has enabled this feature. (TBD)

13. Merchant is required to request a payment inquiry. This is not required if merchant has enabled backend response.

14. 2C2P returns payment inquiry details. This is not required if the merchant has enabled a backend response.

15. Merchant displays the payment result to customer.
