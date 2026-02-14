"use client";

import { useEffect, useRef, useState } from "react";
import CameraIcon from "../icons/camera";
import CloseIcon from "../icons/close";
import Button from "../button";
import ColorButton from "../color-button";
import AirPlaneIcon from "../icons/airplane";
import { postFormData } from "@/api/services/request";
import ArrowPathIcon from "../icons/arrow-path";
import base64ToBlob from "../../utils/utils";
export default function TakePhoto(props: { setIsOpen: any }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [description, setDescription] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const streamRef = useRef<MediaStream | null>(null);


  useEffect(() => {

    if (!photo) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [photo]);

  async function startCamera(mode = facingMode) {
    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
    }
  }

  async function handlePhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const formData = new FormData();
    if(photo){

      formData.append("photo_path", photo);
      formData.append("description", description);

      try {
        const response = await postFormData("/social-media/story", formData);
        console.log(response);
      } catch (error) {
        console.log(error);
        setPhoto(null);

      }
    }
  }

  function CloseModal (){
    stopCamera();
    props.setIsOpen(false);
  }

  function stopCamera() {
    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
  }

  function toggleCamera() {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  }



  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    
    setPhoto(base64ToBlob(canvas.toDataURL("image/png")));
    stopCamera();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fundo escuro */}
      <div
        className="fixed inset-0 bg-black opacity-80"
        onClick={() => {}}
      ></div>

      {/* Conteúdo do modal */}
      <div className={`w-full sm:w-1/3 flex flex-col justify-between bg-white dark:bg-neutral-900 sm:rounded-2xl shadow-md text-white dark:text-neutral-600 z-10  `}>

        {!photo && (
          <div className="relative w-full justify-center">

            <div className="w-full h-[100vh] sm:h-[97vh] overflow-hidden sm:rounded-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              ></video>
            </div>
            <div className="w-full absolute top-0 p-2">
              <Button
                onClick={() => CloseModal()}
                className="text-white p-3 rounded-full aspect-square"
              >
                <CloseIcon className="size-5" />
              </Button>
              
            </div>
            <div className="w-full flex flex-col absolute bottom-0 p-2">
              <div className="flex justify-center">

                <Button
                  onClick={takePhoto}
                  className="text-white p-4 rounded-full aspect-square outline outline-4 outline-white/20"
                >
                  <CameraIcon className="size-6" />
                </Button>
              </div>
              <div className="flex flex-row justify-end">

                <Button
                  onClick={toggleCamera}
                  className="text-white p-3 rounded-full aspect-square"
                >
                  <ArrowPathIcon className="size-5" />
                </Button>
              </div>
              
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {photo && (
          <div className="relative w-full h-[100vh] sm:h-[97vh]">
            <div className="absolute w-full top-0 p-2">
              <Button
                onClick={() => setPhoto(null)}
                className="text-white p-3 rounded-full aspect-square"
              >
                <CloseIcon className="size-5" />
              </Button>
            </div>

            <img
              src={URL.createObjectURL(photo)}
              alt="Foto"
              className="w-full h-full object-cover rounded-lg"
            />

            <div className="w-full absolute bottom-0 flex flex-row justify-between p-2 gap-2">
              <div className="flex flex-row bg-neutral-100 dark:bg-neutral-800/70 dark:text-white w-full rounded-full pl-4 pr-4">
                <input
                  type="text"
                  onChange={ (e) => setDescription(e.target.value)}
                  className="w-full hover:text-border-0 ml-2 focus:outline-none p-4 rounded-full dark:text-white-400"
                  placeholder="Uma descrição bem legal..."
                />
              </div>
              
              <ColorButton
                onClick={(e) => handlePhoto(e)}
                className="text-white p-4 rounded-full aspect-square"
              >
                <AirPlaneIcon className="size-6" />
              </ColorButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
