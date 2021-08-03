Paddle.Environment.set('sandbox');
    Paddle.Setup({ 
      vendor: 2714,
      completeDetails: true,
      eventCallback: function(data) {
      // The data.event will specify the event type
      if (data.event === "Checkout.Complete") {
        console.log(data.eventData); // Data specifics on the event
      }
    }
     });


     function openCheckout() {
        Paddle.Checkout.open({ 
            product: 14608,
            successCallback: "checkoutComplete"
        });
      }
      document.getElementById('buy').addEventListener('click', openCheckout, false);

      function checkoutComplete(data) {
        console.log(data.checkout.id);
        location.href= `http://localhost:3000/thanks/?id=${data.checkout.id}`;
      }