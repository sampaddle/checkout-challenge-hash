Paddle.Environment.set('sandbox');
    Paddle.Setup({ 
      vendor: 2714,
      completeDetails: true,
      eventCallback: function(data) {
      // The data.event will specify the event type
      if (data.event === "Checkout.Complete") {
        console.log(data.eventData); // Data specifics on the event
      }
      if (data.event === "Checkout.Loaded") {
        
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

        // IF YOU WANT TO PASS THE CHECKOUT HASH TO THE BACK END USING LOCAL STORAGE 
        // localStorage.setItem("hash", data.checkout.id);
        // location.href= `http://localhost:3000/thanks/`;
        // THE CORRESPONDING CODE TO RECEIVE IT IS IN INDEX.HTML

        // IF YOU WANTED TO DO IT VIA PASSTHROUGH URL (SUPERIOR WAY, MORE EFFICIENT)
        // force redirect on checkout complete passing in the hash
        location.href= `http://localhost:3000/thanks/?id=${data.checkout.id}`;
      }