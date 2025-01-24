import axios from "../node_modules/";
        const form = document.getElementById('theButton');
        const fileInput = document.getElementById('fileInput');

        form.addEventListener('click', async (event) => {
   

            const imageFormData = new FormData();
            for (const file of fileInput.files) {
                imageFormData.append('image', file);
            }

            const requestOptions = {
                method: "POST",
                body: imageFormData,
                redirect: "follow"
            };
            

            try {
                const response = await fetch("http://localhost:3000/upload-multiple", requestOptions);

                if (response.ok) {
                    console.log("Images uploaded successfully:", await response.json());
                } else {
                    console.error("Failed to upload images:", response.statusText);
                }
            } catch (error) {
                console.error("Error uploading images:", error);
            }

           
        });
