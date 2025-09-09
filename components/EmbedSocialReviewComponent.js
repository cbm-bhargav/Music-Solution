// import React, { useEffect, useState } from 'react';

// const EmbedSocialReviewComponent = ({ blok }) => {
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     loadEmbedSocial(() => {
//       setLoaded(true);
//     });
//   });

//   const loadEmbedSocial = (callback) => {
//     const existingScript = document.getElementById('embedSocial');
//     if (!existingScript) {
//       const script = document.createElement('script');
//       script.src = 'https://embedsocial.com/embedscript/ri.js';
//       script.id = 'embedSocial';
//       script.defer = true;
//       script.innerHTML = `function(d, s, id){
//                 if (d.getElementById(id)) {
//                 d.getElementById(id).parentNode.removeChild(d.getElementById(id));
//                 }
//                 let js = d.createElement(s);
//                 js.id = id;
//                 d.getElementsByTagName("body").appendChild(js);
//                 }(document, "script", "EmbedSocialReviewsScript")`;
//       document.body.appendChild(script);
//       script.onload = () => {
//         if (callback) callback();
//       };
//     }
//     if (existingScript && callback) callback();
//   };

//   return (
//     <div className='w-full lg:block hidden'>
//       {loaded ? (
//         <div id='review' className='embedsocial-reviews' data-ref='4bf1fec9e7d0d1d6769f2effef9226262508a9b4' />
//       ) : (
//         <></>
//       )}
//     </div>
//   );
// };

// export default EmbedSocialReviewComponent;
//------------------------------------------
// import React, { useEffect, useState } from "react";

// const EmbedSocialReviewComponent = ({ blok }) => {
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     const scriptId = "embedSocial";

//     const loadEmbedSocial = (callback) => {
//       let existingScript = document.getElementById(scriptId);

//       if (!existingScript) {
//         const script = document.createElement("script");
//         script.src = "https://embedsocial.com/embedscript/ri.js";
//         script.id = scriptId;
//         script.defer = true;

//         script.onload = () => {
//           if (callback) callback();
//         };

//         document.body.appendChild(script);
//       } else {
//         if (callback) callback();
//       }
//     };

//     loadEmbedSocial(() => {
//       setLoaded(true);
//     });

//     // Cleanup if component unmounts (optional)
//     return () => {
//       const existingScript = document.getElementById(scriptId);
//       if (existingScript) {
//         existingScript.remove();
//       }
//     };
//   }, []); // ✅ runs only once

//   return (
//     <div className="w-full lg:block hidden">
//       {loaded && (
//         <div
//           id="review"
//           className="embedsocial-reviews"
//           data-ref="4bf1fec9e7d0d1d6769f2effef9226262508a9b4"
//         />
//       )}
//     </div>
//   );
// };

// export default EmbedSocialReviewComponent;
//---------------------------------------------------
import React, { useEffect, useState } from "react";

const EmbedSocialReviewComponent = ({ blok }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const scriptId = "embedSocial";

    // Only load script if it hasn't been loaded yet
    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://embedsocial.com/embedscript/ri.js";
      script.id = scriptId;
      script.defer = true;

      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);
    } else {
      // Script already exists, just set loaded
      setIsLoaded(true);
    }

    // Cleanup: optional, but avoid removing if other instances exist
    return () => {
      // You can choose to leave the script in DOM for performance
      // If you really want to remove it, make sure no other components are using it
    };
  }, []);

  return (
    <div className="w-full lg:block hidden">
      {isLoaded && (
        <div
          id="review"
          className="embedsocial-reviews"
          data-ref="4bf1fec9e7d0d1d6769f2effef9226262508a9b4"
        />
      )}
    </div>
  );
};

export default EmbedSocialReviewComponent;
