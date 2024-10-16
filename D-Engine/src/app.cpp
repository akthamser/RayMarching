#include<iostream>

#include"Renderer/shader.h"
#include"Renderer/Window.h"
#include"Renderer/Renderer.h"
#include"ScreenRecorder.h"


int main()
{
    Window window = Window(800, 600,"D-Engine");
    Renderer renderer = Renderer(window);
    glViewport(0, 0, window.Width, window.Height);

    bool recorde = false;
    ScreenRecorder screenRecorder = ScreenRecorder(window.Width, window.Height,144,"Recordings/SecondShader.mp4",false);
    if (recorde)
        screenRecorder.StartRecording();

    double previousTime = glfwGetTime();
    int frameCount = 0;

    while (!window.ShouldClose())
    {
        double currentTime = glfwGetTime();
        frameCount++;

        // If a second has passed, calculate the FPS
        if (currentTime - previousTime >= 1.0) {
            double fps = double(frameCount) / (currentTime - previousTime);
            std::cout << "FPS: " << fps << std::endl;

            // Reset for the next second
            previousTime = currentTime;
            frameCount = 0;
        }

        renderer.Render();
      if(recorde)
        screenRecorder.captureFrame();

        glfwPollEvents();
        window.SwapBuffers();


    }
  
    
    

    glfwTerminate();
    return 0;
}







