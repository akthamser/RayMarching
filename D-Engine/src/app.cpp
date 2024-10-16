#include<iostream>

#include"Renderer/shader.h"
#include"Renderer/Window.h"
#include"Renderer/Renderer.h"
#include"ScreenRecorder.h"


int main()
{
    Window window = Window(1920, 1080,"D-Engine",true);
    Renderer renderer = Renderer(window);
    glViewport(0, 0, window.Width, window.Height);

    bool recorde = true;
    ScreenRecorder screenRecorder = ScreenRecorder(window.Width, window.Height,60,"Recordings/firstTryWater.mp4",true);
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







