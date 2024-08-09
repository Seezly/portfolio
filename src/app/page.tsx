import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-br from-zinc-900 via-indigo-900 to-cyan-900">
      <div id="hero" className="flex h-screen justify-between">
        <div className="w-50">
          <p>I am</p>
          <h1 className="text-[50px] font-bold bg-gradient-to-br from-green-200 to-blue-500 bg-clip-text text-transparent">
            Sergio Gutierrez
          </h1>
          <p>your favorite front-end developer</p>
        </div>
      </div>
    </main>
  );
}
