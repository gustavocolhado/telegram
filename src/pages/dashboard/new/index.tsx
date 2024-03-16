import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { storage, db } from "../../../services/firebaseConnection";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";
import { addDoc, collection} from "firebase/firestore";

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    model: z.string().nonempty("O modelo do carro é obrigatório"),
    regras: z.string().nonempty("O ano do carro é obrigatório"),
    telegram: z.string().nonempty("O ano do carro é obrigatório"),
    description: z.string().nonempty("A descrição é obrigatória")
})

type FormData = z.infer<typeof schema>;


interface ImageItemProps{
    uid: string;
    name: string;
    previewUrl: string;
    url: string;
}

export function New() {

    const { user } = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const [carImages, setCarImages] = useState<ImageItemProps[]>([]);

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files && e.target.files[0]) {
            const image = e.target.files[0]

            if(image.type === 'image/jpeg' || image.type === 'image/png') {
               await handleUpload(image)
            }else {
                alert('A imagem deve ser JPEG ou PNG!');
                return;
            }
        }
    }

    async function handleUpload(image: File) {
        if(!user?.uid) {
            return;
        }

        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

        uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                const imageItem = {
                    name: uidImage,
                    uid: currentUid,
                    previewUrl: URL.createObjectURL(image),
                    url: downloadURL,
                }

                setCarImages((images) => [...images, imageItem] );
                
                console.log(downloadURL);
            })
        })

    }

    function onSubmit(data: FormData) {

        if(carImages.length === 0) {
            toast.error("Envie pelo menos uma imagem do grupo!")
            return;
        }

        const carListImages = carImages.map ( car => {
            return{
                uid: car.uid,
                name: car.name,
                url: car.url
            }
        })

        addDoc(collection(db, "grupos"), {
            name: data.name.toUpperCase(),
            model: data.model,
            telegram: data.telegram,
            regras: data.regras,
            description: data.description,
            created: new Date(),
            owner: user?.name,
            uid: user?.uid,
            images: carListImages,
        })
        .then(() => {
            reset();
            setCarImages([]);
            toast.success("Grupo cadastrado com sucesso!")
            
        })
        .catch((error) => {
            console.log(error)
        })

        console.log(data);
    }

    async function handleDeleteImage(item: ImageItemProps) {
        const imagePath = `images/${item.uid}/${item.name}`;

        const imageRef = ref(storage, imagePath);

        try {
            await deleteObject(imageRef);
            setCarImages(carImages.filter((car) => car.url !== item.url));
        } catch(err) {
            	console.log("ERRO AO DELETAR");
        }
    }

    return (
        <Container>
            <DashboardHeader />

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
                <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
                    <div className="absolute cursor-pointer">
                        <FiUpload size={30} color="#000"></FiUpload>
                    </div>
                    <div className="cursor-pointer">
                        <input className="opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleFile} />
                    </div>
                </button>
                {carImages.map( item => (
                    <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
                        <button className="absolute" onClick={() => handleDeleteImage(item)}>
                            <FiTrash size={28} color="#FFF"/>
                        </button>
                        <img src={item.previewUrl} className="rounded-lg w-full h-32 object-cover" />
                    </div>
                ))}
            </div>

            <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
                <form
                className="w-full"
                onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do Grupo</p>
                        <Input 
                        type="text"
                        register={register}
                        name="name"
                        error={errors.name?.message}
                        placeholder="Ex: [CHAT] Amizades Colorida"
                        />
                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Grupo ou Canal ?</p>
                        <Input 
                        type="text"
                        register={register}
                        name="model"
                        error={errors.model?.message}
                        placeholder="Ex: Canal"
                        />
                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">

                        <div className="w-full">
                            <p className="mb-2 font-medium">Regras</p>
                            <Input 
                            type="text"
                            register={register}
                            name="regras"
                            error={errors.regras?.message}
                            placeholder=""
                            />
                        </div>

                    </div>

                    <div className="flex w-full mb-3 flex-row items-center gap-4">

                        <div className="w-full">
                            <p className="mb-2 font-medium">Link do Canal ou Grupo</p>
                            <Input 
                            type="text"
                            register={register}
                            name="telegram"
                            error={errors.regras?.message}
                            placeholder=""
                            />
                        </div>

                    </div>

                    <div className="mb-3">
                        <p className="mb-2 font-medium">Descrição</p>
                        <textarea
                        className="border-2 w-full rounded-md h-24 px-2"
                        {...register("description")}
                        name="description"
                        id="description"
                        placeholder="Digite a descrição completo sobre o grupo ou canal"
                        />
                        {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
                    </div>

                    <button
                    type="submit"
                    className="w-full h-10 rounded-md bg-zinc-900 text-white font-medium"
                    >
                    Cadastrar
                    </button>

                </form>

            </div>
        </Container>
    )
}