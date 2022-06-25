import { styled } from '@mui/material/styles';
import React from 'react';
import animate from './animate.glsl';
import render from './render.glsl';

const Canvas = styled('canvas')({
  height: 937,
  width: 999
});

const Container = styled('div')({
  display: 'block'
});

const Content = styled('div')({
});

const Surface = () => {
  return (
    <Container id="bg">
      <Content className="content">
        <Canvas id="landscape" className="landscape" width="999" height="937"></Canvas>
        <script id="custom-vertex" type="x-shader/x-vertex">
          {render}
        </script>
        <script id="custom-fragment" type="x-shader/x-fragment">
          {animate}
        </script>
      </Content>
    </Container>
  );
};

export default Surface;
